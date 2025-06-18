
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageLimitService, type ActionType, type UsageData } from '@/services/usageLimitService';
import { useToast } from '@/hooks/use-toast';

export const usePlanLimits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsage();
    }
  }, [user]);

  const loadUsage = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userUsage = await UsageLimitService.getUserUsage(user.id);
      setUsage(userUsage);
    } catch (error) {
      console.error('❌ Erro ao carregar uso do usuário:', error);
    } finally {
      setLoading(false);
    }
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

    try {
      const result = await UsageLimitService.checkLimit(user.id, actionType);
      
      if (!result.canProceed) {
        const limitMessage = UsageLimitService.getLimitMessage(actionType, result.plan);
        const upgradeMessage = UsageLimitService.getUpgradeMessage(result.plan);
        
        toast({
          title: "Limite do Plano Atingido",
          description: `${limitMessage} ${upgradeMessage}`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar limite:', error);
      toast({
        title: "Erro de Verificação",
        description: "Não foi possível verificar os limites do seu plano",
        variant: "destructive"
      });
      return false;
    }
  };

  const incrementUsage = async (actionType: ActionType): Promise<boolean> => {
    if (!user) return false;

    try {
      await UsageLimitService.incrementUsage(user.id, actionType);
      // Recarregar usage após incrementar
      await loadUsage();
      return true;
    } catch (error) {
      console.error('❌ Erro ao incrementar uso:', error);
      return false;
    }
  };

  const getUsagePercentage = (actionType: ActionType): number => {
    if (!usage) return 0;

    let currentUsage: number;
    let limit: number;

    switch (actionType) {
      case 'uploads':
        currentUsage = usage.uploads_realizados;
        limit = usage.uploads_limit || 10;
        break;
      case 'flashcards':
        currentUsage = usage.flashcards_gerados;
        limit = usage.flashcards_limit || 10;
        break;
      case 'quizzes':
        currentUsage = usage.quizzes_realizados;
        limit = usage.quizzes_limit || 10;
        break;
      case 'summaries':
        currentUsage = usage.uploads_realizados; // Summaries são baseados em uploads
        limit = usage.summaries_limit || 10;
        break;
      default:
        return 0;
    }

    if (limit === Infinity || limit === 0) return 0;
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
