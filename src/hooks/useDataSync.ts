
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
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    setSyncing(true);
    try {
      console.log('🔄 Starting historical data sync...');
      
      // Chamar a função do banco para sincronizar dados históricos
      const { data, error } = await supabase.rpc('sync_historical_usage_data', {
        target_user_id: user.id
      });

      if (error) {
        console.error('❌ Error syncing historical data:', error);
        toast({
          title: "Erro na sincronização",
          description: "Não foi possível sincronizar os dados históricos.",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ Historical data synced successfully');
      toast({
        title: "✅ Dados sincronizados!",
        description: "Seus dados foram atualizados com base no histórico real.",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('❌ Critical error during sync:', error);
      toast({
        title: "Erro crítico",
        description: "Erro inesperado durante a sincronização.",
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

      const storedCounts = {
        uploads: usageData?.uploads_realizados || 0,
        flashcards: usageData?.flashcards_gerados || 0,
        quizzes: usageData?.quizzes_realizados || 0
      };

      const isInconsistent = 
        realCounts.uploads !== storedCounts.uploads ||
        realCounts.flashcards !== storedCounts.flashcards ||
        realCounts.quizzes !== storedCounts.quizzes;

      console.log('📊 Data consistency check:', {
        realCounts,
        storedCounts,
        isInconsistent
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

  return {
    syncHistoricalData,
    checkDataConsistency,
    syncing
  };
};
