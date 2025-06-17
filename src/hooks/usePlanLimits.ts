
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PlanLimitService, ActionType, UserUsage } from '@/services/planLimitService';
import { useToast } from '@/hooks/use-toast';

export const usePlanLimits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsage();
    }
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;
    
    setLoading(true);
    const userUsage = await PlanLimitService.checkUserLimits(user.id);
    setUsage(userUsage);
    setLoading(false);
  };

  const checkLimit = async (actionType: ActionType): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return false;
    }

    const result = await PlanLimitService.canPerformAction(user.id, actionType);
    
    if (!result.canProceed) {
      toast({
        title: "Limite do Plano Atingido",
        description: result.message || "Você atingiu o limite do seu plano atual",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const incrementUsage = async (actionType: ActionType): Promise<boolean> => {
    if (!user) return false;

    const success = await PlanLimitService.incrementUsage(user.id, actionType);
    if (success) {
      // Recarregar usage após incrementar
      await loadUsage();
    }
    return success;
  };

  const getUsagePercentage = (actionType: ActionType): number => {
    if (!usage) return 0;

    let currentUsage: number;
    let limit: number;

    switch (actionType) {
      case 'upload':
        currentUsage = usage.uploads_realizados;
        limit = usage.plan_limits.uploads_limit;
        break;
      case 'flashcard':
        currentUsage = usage.flashcards_gerados;
        limit = usage.plan_limits.flashcards_limit;
        break;
      case 'quiz':
        currentUsage = usage.quizzes_realizados;
        limit = usage.plan_limits.quizzes_limit;
        break;
      default:
        return 0;
    }

    if (limit === -1) return 0; // Ilimitado
    return Math.min((currentUsage / limit) * 100, 100);
  };

  return {
    usage,
    loading,
    checkLimit,
    incrementUsage,
    getUsagePercentage,
    refreshUsage: loadUsage
  };
};
