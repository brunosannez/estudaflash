
import { UsageLimitService, type ActionType } from '@/services/usageLimitService';
import { useUsageData } from '@/hooks/useUsageData';
import { useUsageValidation } from '@/hooks/useUsageValidation';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useUsagePercentage } from '@/hooks/useUsagePercentage';

export const useUsageLimit = () => {
  const { usageData, loading, refreshUsage } = useUsageData();
  const { checkCanProceed: baseCheckCanProceed, incrementUsage } = useUsageValidation();
  const { upgradeModalData, openUpgradeModal } = useUpgradeModal();
  const { getUsagePercentage: baseGetUsagePercentage } = useUsagePercentage();

  const checkCanProceed = async (actionType: ActionType): Promise<boolean> => {
    const canProceed = await baseCheckCanProceed(actionType);
    
    if (!canProceed && usageData) {
      // Se não pode proceder, abrir modal de upgrade
      const result = await UsageLimitService.checkLimit(usageData.user_id, actionType);
      if (!result.canProceed) {
        openUpgradeModal(actionType, result.plan);
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
