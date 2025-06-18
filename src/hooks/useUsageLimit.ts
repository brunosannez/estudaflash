
import { UsageLimitService } from '@/services/usageLimitService';
import type { ActionType } from '@/services/usageLimitsConfig';
import { useUsageData } from '@/hooks/useUsageData';
import { useUsageValidation } from '@/hooks/useUsageValidation';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useUsagePercentage } from '@/hooks/useUsagePercentage';
import { PlanType } from '@/types/plans';

export const useUsageLimit = () => {
  const { usageData, loading, refreshUsage } = useUsageData();
  const { checkCanProceed: baseCheckCanProceed, incrementUsage } = useUsageValidation();
  const { upgradeModalData, openUpgradeModal } = useUpgradeModal();
  const { getUsagePercentage: baseGetUsagePercentage } = useUsagePercentage();

  const checkCanProceed = async (actionType: ActionType): Promise<boolean> => {
    const canProceed = await baseCheckCanProceed(actionType);
    
    if (!canProceed && usageData) {
      const result = await UsageLimitService.checkLimit(usageData.user_id, actionType);
      if (!result.canProceed) {
        const planType = (result.plan as PlanType) || 'free';
        openUpgradeModal(actionType, planType);
      }
    }
    
    return canProceed;
  };

  const getUsagePercentage = (actionType: ActionType): number => {
    return baseGetUsagePercentage(usageData, actionType);
  };

  return {
    usageData,
    loading,
    checkCanProceed,
    incrementUsage,
    getUsagePercentage,
    refreshUsage,
    upgradeModalData,
  };
};
