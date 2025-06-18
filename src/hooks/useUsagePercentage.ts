
import { UsageData } from '@/services/usageLimitService';
import type { ActionType } from '@/services/usageLimitsConfig';
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
        limit = usageData.uploads_limit || planConfig.uploads;
        break;
      case 'flashcards':
        current = usageData.flashcards_gerados;
        limit = usageData.flashcards_limit || planConfig.flashcards;
        break;
      case 'quizzes':
        current = usageData.quizzes_realizados;
        limit = usageData.quizzes_limit || planConfig.quizzes;
        break;
      case 'summaries':
        current = usageData.uploads_realizados;
        limit = usageData.summaries_limit || planConfig.summaries || planConfig.uploads;
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
