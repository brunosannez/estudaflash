
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageDataService } from '@/services/usageDataService';
import { UsageIncrementService } from '@/services/usageIncrementService';
import { useToast } from '@/hooks/use-toast';
import { ActionType } from '@/services/usageLimitsConfig';

export const useUsageValidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);

  const checkCanProceed = useCallback(async (actionType: ActionType): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para realizar esta ação.",
        variant: "destructive"
      });
      return false;
    }

    setValidating(true);
    
    try {
      console.log(`🔍 Verificando limite para ${actionType}...`);
      
      const usageData = await UsageDataService.getUserUsage(user.id);
      if (!usageData) {
        throw new Error('Não foi possível obter dados de uso');
      }

      // Verificar se é admin (sem limitações)
      if (usageData.is_admin) {
        console.log('👑 Usuário admin - sem limitações');
        return true;
      }

      // Verificar limites específicos
      let current: number;
      let limit: number;
      let actionName: string;

      switch (actionType) {
        case 'uploads':
          current = usageData.uploads_realizados;
          limit = usageData.uploads_limit;
          actionName = 'uploads';
          break;
        case 'summaries':
          current = usageData.uploads_realizados; // Summaries são baseados em uploads
          limit = usageData.summaries_limit;
          actionName = 'resumos';
          break;
        case 'flashcards':
          current = usageData.flashcards_gerados;
          limit = usageData.flashcards_limit;
          actionName = 'flashcards';
          break;
        case 'quizzes':
          current = usageData.quizzes_realizados;
          limit = usageData.quizzes_limit;
          actionName = 'quizzes';
          break;
        default:
          return true;
      }

      // Verificar se o limite foi atingido
      const isUnlimited = limit === -1 || limit === Infinity;
      const canProceed = isUnlimited || current < limit;

      console.log(`📊 Verificação de limite:`, {
        actionType,
        current,
        limit,
        canProceed,
        plan: usageData.plan_name
      });

      if (!canProceed) {
        const planName = usageData.plan_name || usageData.plano.toUpperCase();
        toast({
          title: "Limite do Plano Atingido",
          description: `Você atingiu o limite de ${actionName} do plano ${planName} (${current}/${limit}). Faça upgrade para continuar!`,
          variant: "destructive"
        });
        return false;
      }

      // Aviso quando próximo do limite (90%)
      if (!isUnlimited && current >= limit * 0.9) {
        toast({
          title: "Próximo do Limite",
          description: `Você está próximo do limite de ${actionName} (${current}/${limit}). Considere fazer upgrade!`,
          variant: "default"
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na validação de uso:', error);
      toast({
        title: "Erro de Validação",
        description: "Não foi possível verificar os limites do seu plano. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setValidating(false);
    }
  }, [user, toast]);

  const incrementUsage = useCallback(async (actionType: ActionType): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log(`📈 Incrementando uso: ${actionType}`);
      await UsageIncrementService.incrementUsage(user.id, actionType);
      console.log(`✅ Uso incrementado com sucesso: ${actionType}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao incrementar uso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu uso. A ação foi realizada, mas o contador pode estar desatualizado.",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    checkCanProceed,
    incrementUsage,
    validating
  };
};
