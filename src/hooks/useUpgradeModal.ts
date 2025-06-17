
import { useState } from 'react';
import { type ActionType } from '@/services/usageLimitService';
import { PlanType } from '@/types/plans';

export const useUpgradeModal = () => {
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    actionType: ActionType | null;
    plan: PlanType;
  }>({
    isOpen: false,
    actionType: null,
    plan: 'free',
  });

  const openUpgradeModal = (actionType: ActionType, plan: PlanType) => {
    setUpgradeModal({
      isOpen: true,
      actionType,
      plan,
    });
  };

  const closeUpgradeModal = () => {
    setUpgradeModal({
      isOpen: false,
      actionType: null,
      plan: 'free',
    });
  };

  return {
    upgradeModalData: {
      isOpen: upgradeModal.isOpen,
      onClose: closeUpgradeModal,
      currentPlan: upgradeModal.plan,
      actionType: upgradeModal.actionType || '',
    },
    openUpgradeModal,
    closeUpgradeModal,
  };
};
