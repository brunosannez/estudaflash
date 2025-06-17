
import { supabase } from '@/integrations/supabase/client';
import { useRealUserCounts } from './useRealUserCounts';

export const useConsistencyChecker = () => {
  const { getRealUserCounts } = useRealUserCounts();

  const checkDataConsistency = async (userId: string) => {
    if (!userId) return null;

    try {
      const [realCounts, currentUsage] = await Promise.all([
        getRealUserCounts(userId),
        supabase
          .from('uso_usuarios')
          .select('*')
          .eq('user_id', userId)
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

  return { checkDataConsistency };
};
