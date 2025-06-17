
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageLimitService, type ActionType } from '@/services/usageLimitService';
import { useToast } from '@/hooks/use-toast';
import { PlanType } from '@/types/plans';

export const useUsageValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);

  const checkCanProceed = async (actionType: ActionType): Promise<boolean> => {
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return false;
    }

    setChecking(true);
    try {
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

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar limite:', error);
      toast({
        title: "⚠️ Erro de Verificação",
        description: "Não foi possível verificar os limites do seu plano. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setChecking(false);
    }
  };

  const incrementUsage = async (actionType: ActionType): Promise<boolean> => {
    if (!user) return false;

    try {
      await UsageLimitService.incrementUsage(user.id, actionType);
      console.log(`✅ Uso incrementado para ${actionType}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao incrementar uso para ${actionType}:`, error);
      return false;
    }
  };

  return {
    checkCanProceed,
    incrementUsage,
    checking
  };
};
