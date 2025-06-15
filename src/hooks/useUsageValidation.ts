
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitService, type ActionType } from '@/services/usageLimitService';

export const useUsageValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();

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
      // Não precisa chamar fetchUsageData aqui, o listener vai capturar a mudança
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contador de uso.",
        variant: "destructive",
      });
    }
  };

  return {
    checkCanProceed,
    incrementUsage,
  };
};
