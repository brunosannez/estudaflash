
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Função para contar dados reais do usuário
  const getRealUserCounts = async (userId: string) => {
    console.log('📊 Contando dados reais para usuário:', userId);

    // Contar uploads
    const { count: uploadCount, error: uploadError } = await supabase
      .from('uploads')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (uploadError) {
      console.error('❌ Erro ao contar uploads:', uploadError);
      throw uploadError;
    }

    // Contar flashcards gerados
    const { count: flashcardCount, error: flashcardError } = await supabase
      .from('flashcards')
      .select(`
        id,
        resumo_id!inner(
          upload_id!inner(user_id)
        )
      `, { count: 'exact' })
      .eq('resumo_id.upload_id.user_id', userId);

    if (flashcardError) {
      console.error('❌ Erro ao contar flashcards:', flashcardError);
      throw flashcardError;
    }

    // Contar quizzes respondidos
    const { count: quizCount, error: quizError } = await supabase
      .from('quiz_respostas')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (quizError) {
      console.error('❌ Erro ao contar quiz respostas:', quizError);
      throw quizError;
    }

    const counts = {
      uploads: uploadCount || 0,
      flashcards: flashcardCount || 0,
      quizzes: quizCount || 0
    };

    console.log('✅ Contagens reais obtidas:', counts);
    return counts;
  };

  // Função para forçar sincronização completa
  const forceSyncUserData = async () => {
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return false;
    }

    setSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização forçada para:', user.id);

      // 1. Obter contagens reais
      const realCounts = await getRealUserCounts(user.id);

      // 2. Verificar se já existe registro do usuário
      const { data: existingUsage, error: fetchError } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Erro ao buscar uso atual:', fetchError);
        throw fetchError;
      }

      // 3. Criar ou atualizar registro
      if (!existingUsage) {
        console.log('📝 Criando novo registro de uso...');
        const { error: insertError } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: user.id,
            uploads_realizados: realCounts.uploads,
            flashcards_gerados: realCounts.flashcards,
            quizzes_realizados: realCounts.quizzes,
            plano: 'free'
          });

        if (insertError) {
          console.error('❌ Erro ao criar registro:', insertError);
          throw insertError;
        }
      } else {
        console.log('🔄 Atualizando registro existente...');
        const { error: updateError } = await supabase
          .from('uso_usuarios')
          .update({
            uploads_realizados: realCounts.uploads,
            flashcards_gerados: realCounts.flashcards,
            quizzes_realizados: realCounts.quizzes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar registro:', updateError);
          throw updateError;
        }
      }

      console.log('✅ Sincronização completa! Dados atualizados:', realCounts);
      
      toast({
        title: "✅ Dados Sincronizados!",
        description: `Uploads: ${realCounts.uploads}, Flashcards: ${realCounts.flashcards}, Quizzes: ${realCounts.quizzes}`,
        duration: 3000,
      });

      setHasInitialized(true);
      return true;

    } catch (error) {
      console.error('❌ Erro crítico na sincronização:', error);
      toast({
        title: "❌ Erro na Sincronização",
        description: "Não foi possível sincronizar os dados. Tentando novamente...",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Função para verificar inconsistências
  const checkDataConsistency = async () => {
    if (!user) return null;

    try {
      const [realCounts, currentUsage] = await Promise.all([
        getRealUserCounts(user.id),
        supabase
          .from('uso_usuarios')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      const storedCounts = currentUsage.data ? {
        uploads: currentUsage.data.uploads_realizados || 0,
        flashcards: currentUsage.data.flashcards_gerados || 0,
        quizzes: currentUsage.data.quizzes_realizados || 0
      } : { uploads: 0, flashcards: 0, quizzes: 0 };

      const isInconsistent = !currentUsage.data || 
        realCounts.uploads !== storedCounts.uploads ||
        realCounts.flashcards !== storedCounts.flashcards ||
        realCounts.quizzes !== storedCounts.quizzes;

      console.log('🔍 Verificação de consistência:', {
        realCounts,
        storedCounts,
        isInconsistent,
        hasUsageRecord: !!currentUsage.data
      });

      return { realCounts, storedCounts, isInconsistent };
    } catch (error) {
      console.error('❌ Erro na verificação de consistência:', error);
      return null;
    }
  };

  // Sincronização automática na inicialização
  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('🚀 Iniciando sincronização automática...');
      forceSyncUserData();
    }
  }, [user, hasInitialized]);

  return {
    syncing,
    hasInitialized,
    forceSyncUserData,
    checkDataConsistency,
    getRealUserCounts
  };
};
