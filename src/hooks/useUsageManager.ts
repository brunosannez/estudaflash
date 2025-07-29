
import { useCallback } from 'react';
import { useUsageData } from '@/hooks/useUsageData';
import { UsageLimitService } from '@/services/usageLimitService';
import type { ActionType } from '@/services/usageLimitsConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PlanType } from '@/types/plans';

export const useUsageManager = () => {
  const { user } = useAuth();
  const { usageData, loading, error, refreshUsage } = useUsageData();
  const { toast } = useToast();

  const checkCanProceed = useCallback(async (actionType: ActionType): Promise<boolean> => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado para verificação de limite');
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para usar esta funcionalidade",
        variant: "destructive"
      });
      return false;
    }

    // Se ainda está carregando, aguardar
    if (loading) {
      console.log('⏳ Aguardando carregamento dos dados de uso...');
      return false;
    }

    try {
      console.log(`🔍 Verificando limite para ${actionType}...`);
      const result = await UsageLimitService.checkLimit(user.id, actionType);
      
      if (!result.canProceed) {
        const planType = result.plan as PlanType;
        const limitMessage = UsageLimitService.getLimitMessage(actionType, planType);
        const upgradeMessage = UsageLimitService.getUpgradeMessage(planType);
        
        toast({
          title: "❌ Limite Atingido",
          description: `${limitMessage} ${upgradeMessage}`,
          variant: "destructive",
          duration: 5000,
        });
        
        console.log(`🚫 Limite atingido para ${actionType}:`, result);
        return false;
      }

      if (result.isNearLimit) {
        toast({
          title: "⚠️ Próximo do Limite",
          description: `Você está próximo do limite de ${actionType}. Considere fazer upgrade do seu plano.`,
          duration: 4000,
        });
      }

      console.log(`✅ Pode prosseguir com ${actionType}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar limite:', error);
      toast({
        title: "⚠️ Erro de Verificação",
        description: "Não foi possível verificar os limites. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  }, [user?.id, loading, toast]);

  const incrementUsage = useCallback(async (actionType: ActionType): Promise<boolean> => {
    if (!user?.id) {
      console.log('❌ Usuário não autenticado para incrementar uso');
      return false;
    }

    try {
      console.log(`📈 Incrementando uso para ${actionType}...`);
      await UsageLimitService.incrementUsage(user.id, actionType);
      console.log(`✅ Uso incrementado para ${actionType}`);
      
      // Refresh dos dados após incrementar com delay
      setTimeout(() => {
        refreshUsage();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error(`❌ Erro ao incrementar uso para ${actionType}:`, error);
      return false;
    }
  }, [user?.id, refreshUsage]);

  const getUsagePercentage = useCallback((actionType: ActionType): number => {
    if (!usageData) return 0;

    let current = 0;
    let limit = 0;

    switch (actionType) {
      case 'uploads':
        current = usageData.uploads_realizados;
        limit = usageData.uploads_limit || 10;
        break;
      case 'flashcards':
        current = usageData.flashcards_gerados;
        limit = usageData.flashcards_limit || 10;
        break;
      case 'quizzes':
        current = usageData.quizzes_realizados;
        limit = usageData.quizzes_limit || 10;
        break;
      case 'summaries':
        current = usageData.uploads_realizados;
        limit = usageData.summaries_limit || 10;
        break;
      default:
        return 0;
    }

    if (limit === Infinity || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  }, [usageData]);

  return {
    usageData,
    loading,
    error,
    checkCanProceed,
    incrementUsage,
    getUsagePercentage,
    refreshUsage,
  };
};
