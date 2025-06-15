
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const syncHistoricalData = async () => {
    if (!user) {
      console.log('❌ User not authenticated, skipping sync');
      return false;
    }

    setSyncing(true);
    try {
      console.log('🔄 Starting comprehensive data sync...');
      
      // Contar uploads reais
      const { count: uploadCount } = await supabase
        .from('uploads')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Contar flashcards gerados (via resumos do usuário)
      const { count: flashcardCount } = await supabase
        .from('flashcards')
        .select(`
          id,
          resumo_id!inner(
            upload_id!inner(user_id)
          )
        `, { count: 'exact' })
        .eq('resumo_id.upload_id.user_id', user.id);

      // Contar quizzes respondidos
      const { count: quizCount } = await supabase
        .from('quiz_respostas')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      const realCounts = {
        uploads: uploadCount || 0,
        flashcards: flashcardCount || 0,
        quizzes: quizCount || 0
      };

      console.log('📊 Real counts found:', realCounts);

      // Buscar dados atuais do usuário
      const { data: currentUsage } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Se não existe registro, criar um novo
      if (!currentUsage) {
        console.log('📝 Creating new usage record...');
        const { error } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: user.id,
            uploads_realizados: realCounts.uploads,
            flashcards_gerados: realCounts.flashcards,
            quizzes_realizados: realCounts.quizzes,
            plano: 'free',
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('❌ Error creating usage record:', error);
          throw error;
        }
      } else {
        // Atualizar registro existente com dados reais
        console.log('🔄 Updating existing usage record...');
        const { error } = await supabase
          .from('uso_usuarios')
          .update({
            uploads_realizados: realCounts.uploads,
            flashcards_gerados: realCounts.flashcards,
            quizzes_realizados: realCounts.quizzes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error updating usage record:', error);
          throw error;
        }
      }

      console.log('✅ Data sync completed successfully:', realCounts);
      
      toast({
        title: "✅ Dados Sincronizados!",
        description: `Uploads: ${realCounts.uploads}, Flashcards: ${realCounts.flashcards}, Quizzes: ${realCounts.quizzes}`,
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Critical error during sync:', error);
      toast({
        title: "Erro na Sincronização",
        description: "Não foi possível sincronizar os dados. Tentando novamente...",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const checkDataConsistency = async () => {
    if (!user) return null;

    try {
      // Buscar contadores atuais
      const { data: usageData } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Contar dados reais
      const [uploadsResult, flashcardsResult, quizzesResult] = await Promise.all([
        supabase.from('uploads').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('flashcards')
          .select(`id, resumo_id!inner(upload_id!inner(user_id))`, { count: 'exact' })
          .eq('resumo_id.upload_id.user_id', user.id),
        supabase.from('quiz_respostas').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      const realCounts = {
        uploads: uploadsResult.count || 0,
        flashcards: flashcardsResult.count || 0,
        quizzes: quizzesResult.count || 0
      };

      const storedCounts = usageData ? {
        uploads: usageData.uploads_realizados || 0,
        flashcards: usageData.flashcards_gerados || 0,
        quizzes: usageData.quizzes_realizados || 0
      } : { uploads: 0, flashcards: 0, quizzes: 0 };

      // Verificar se há inconsistência
      const isInconsistent = !usageData || 
        realCounts.uploads !== storedCounts.uploads ||
        realCounts.flashcards !== storedCounts.flashcards ||
        realCounts.quizzes !== storedCounts.quizzes;

      console.log('📊 Data consistency check:', {
        realCounts,
        storedCounts,
        isInconsistent,
        hasUsageData: !!usageData
      });

      return {
        realCounts,
        storedCounts,
        isInconsistent
      };
    } catch (error) {
      console.error('❌ Error checking data consistency:', error);
      return null;
    }
  };

  const forceSyncIfNeeded = async () => {
    const consistencyCheck = await checkDataConsistency();
    if (consistencyCheck?.isInconsistent) {
      console.log('⚠️ Inconsistency detected, forcing sync...');
      return await syncHistoricalData();
    }
    return true;
  };

  return {
    syncHistoricalData,
    checkDataConsistency,
    forceSyncIfNeeded,
    syncing
  };
};
