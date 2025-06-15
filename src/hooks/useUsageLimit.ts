
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitService, type ActionType, type UsageData } from '@/services/usageLimitService';
import UpgradeModal from '@/components/usage/UpgradeModal';
import { PlanType } from '@/types/plans';

export const useUsageLimit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    actionType: ActionType | null;
    plan: PlanType;
  }>({
    isOpen: false,
    actionType: null,
    plan: 'free',
  });

  const fetchUsageData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await UsageLimitService.getUserUsage(user.id);
      setUsageData(data);
    } catch (error) {
      console.error('Erro ao buscar dados de uso:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [user]);

  const checkCanProceed = async (actionType: ActionType): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para realizar esta ação.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await UsageLimitService.checkLimit(user.id, actionType);
      
      if (!result.canProceed) {
        setUpgradeModal({
          isOpen: true,
          actionType,
          plan: result.plan,
        });
        return false;
      }

      // Avisar quando próximo do limite (90%)
      if (result.isNearLimit && result.limit > 0) {
        toast({
          title: "Próximo do limite",
          description: `Você está próximo do limite de ${actionType}. ${result.currentUsage}/${result.limit} usado.`,
          variant: "default",
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar limite de uso. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const incrementUsage = async (actionType: ActionType): Promise<void> => {
    if (!user) return;

    try {
      await UsageLimitService.incrementUsage(user.id, actionType);
      await fetchUsageData();
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contador de uso.",
        variant: "destructive",
      });
    }
  };

  const getUsagePercentage = (actionType: ActionType): number => {
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

  const closeUpgradeModal = () => {
    setUpgradeModal({
      isOpen: false,
      actionType: null,
      plan: 'free',
    });
  };

  return {
    usageData,
    loading,
    checkCanProceed,
    incrementUsage,
    getUsagePercentage,
    refreshUsage: fetchUsageData,
    UpgradeModalComponent: () => (
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={closeUpgradeModal}
        currentPlan={upgradeModal.plan}
        actionType={upgradeModal.actionType || ''}
      />
    ),
  };
};
