
import { useUsageValidation } from '@/hooks/useUsageValidation';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useUsagePercentage } from '@/hooks/useUsagePercentage';
import { useUsageData } from '@/hooks/useUsageData';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { UsageLimitService } from '@/services/usageLimitService';
import { PlanType } from '@/types/plans';
import type { ActionType } from '@/services/usageLimitsConfig';

export const useUsageLimit = () => {
  const { usageData, loading, refreshUsage } = useUsageData();
  const { checkCanProceed: baseCheckCanProceed, incrementUsage: baseIncrementUsage } = useUsageValidation();
  const { upgradeModalData, openUpgradeModal } = useUpgradeModal();
  const { getUsagePercentage: baseGetUsagePercentage } = useUsagePercentage();
  
  // Integração com novo sistema de créditos
  const { 
    checkCanProceed: creditsCheckCanProceed, 
    consumeCredits,
    userCredits 
  } = useCreditsSystem();

  const checkCanProceed = async (actionType: ActionType): Promise<boolean> => {
    // Usar sistema de créditos se disponível, senão usar sistema legado
    if (userCredits) {
      return await creditsCheckCanProceed(actionType);
    }
    
    // Sistema legado para compatibilidade
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

  const incrementUsage = async (actionType: ActionType): Promise<boolean> => {
    // Usar sistema de créditos se disponível
    if (userCredits) {
      return await consumeCredits(actionType);
    }
    
    // Sistema legado para compatibilidade
    return await baseIncrementUsage(actionType);
  };

  const getUsagePercentage = (actionType: ActionType): number => {
    // Se usando sistema de créditos, calcular baseado nos créditos
    if (userCredits && userCredits.total_per_month > 0) {
      return Math.min((userCredits.used_this_month / userCredits.total_per_month) * 100, 100);
    }
    
    // Sistema legado
    return baseGetUsagePercentage(usageData, actionType);
  };

  return {
    usageData,
    userCredits, // Novo campo para sistema de créditos
    loading,
    checkCanProceed,
    incrementUsage,
    getUsagePercentage,
    refreshUsage,
    upgradeModalData,
  };
};
