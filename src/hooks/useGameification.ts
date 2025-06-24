
import { useUnifiedProgress } from './useUnifiedProgress';
import { ActivityType } from '@/types/gamification';
import { toast } from 'sonner';

export const useGameification = () => {
  const { 
    progress, 
    todayActivity, 
    loading, 
    error, 
    isInitialized, 
    getStats, 
    addXP: baseAddXP, 
    refreshProgress 
  } = useUnifiedProgress();

  const addXP = async (xpAmount: number, activityType: ActivityType) => {
    try {
      console.log(`🎯 Adding ${xpAmount} XP for activity: ${activityType}`);
      
      await baseAddXP(xpAmount);
      
      // Show appropriate toast based on activity type
      if (activityType === 'flashcard') {
        toast.success(`🧠 Flashcard revisado! +${xpAmount} XP`, { duration: 2000 });
      } else if (activityType === 'quiz_correct') {
        toast.success(`🎉 Resposta correta! +${xpAmount} XP`, { duration: 2000 });
      } else if (activityType === 'quiz_incorrect') {
        toast(`💪 Continue tentando! +${xpAmount} XP`, { duration: 2000 });
      }
      
    } catch (error) {
      console.error('❌ Error adding XP:', error);
      toast.error('Erro ao adicionar XP');
    }
  };

  return {
    progress,
    todayActivity,
    loading,
    error,
    isInitialized,
    addXP,
    fetchUserProgress: refreshProgress,
    getStats
  };
};

export * from '@/types/gamification';
