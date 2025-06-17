
import { type ActionType, type UsageData } from '@/services/usageLimitService';

export const useUsagePercentage = () => {
  const getUsagePercentage = (usageData: UsageData | null, actionType: ActionType): number => {
    if (!usageData) return 0;
    
    const current = {
      uploads: usageData.uploads_realizados,
      flashcards: usageData.flashcards_gerados,
      quizzes: usageData.quizzes_realizados,
    }[actionType];

    let limit;
    if (usageData.plano === 'free') {
      limit = 10;
    } else if (usageData.plano === 'pro') {
      limit = 100;
    } else {
      return 0; // EDU = ilimitado
    }
    
    return Math.round((current / limit) * 100);
  };

  return {
    getUsagePercentage,
  };
};
