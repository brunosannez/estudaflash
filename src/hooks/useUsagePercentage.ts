
import { UsageData } from '@/services/usageLimitService';
import { ActionType } from '@/services/usageLimitService';
import { PLAN_CONFIGS } from '@/types/plans';

export const useUsagePercentage = () => {
  const getUsagePercentage = (usageData: UsageData | null, actionType: ActionType): number => {
    if (!usageData) return 0;

    const planConfig = PLAN_CONFIGS[usageData.plano];
    if (!planConfig) return 0;

    let current = 0;
    let limit = 0;

    switch (actionType) {
      case 'uploads':
        current = usageData.uploads_realizados;
        limit = planConfig.uploads;
        break;
      case 'flashcards':
        current = usageData.flashcards_gerados;
        limit = planConfig.flashcards;
        break;
      case 'quizzes':
        current = usageData.quizzes_realizados;
        limit = planConfig.quizzes;
        break;
      default:
        return 0;
    }

    if (limit === Infinity || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  return {
    getUsagePercentage,
  };
};
