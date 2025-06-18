
import { useState } from 'react';
import { PlanType } from '@/types/plans';
import type { ActionType } from '@/services/usageLimitsConfig';

interface UpgradeModalData {
  isOpen: boolean;
  currentPlan: PlanType;
  actionType: ActionType;
  onClose: () => void;
}

export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [actionType, setActionType] = useState<ActionType>('uploads');

  const openUpgradeModal = (action: ActionType, plan: PlanType) => {
    setActionType(action);
    setCurrentPlan(plan);
    setIsOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsOpen(false);
  };

  const upgradeModalData: UpgradeModalData = {
    isOpen,
    currentPlan,
    actionType,
    onClose: closeUpgradeModal,
  };

  return {
    upgradeModalData,
    openUpgradeModal,
    closeUpgradeModal,
  };
};
