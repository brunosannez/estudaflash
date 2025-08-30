import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreditsService, ActionCreditsConfig, CreditsUsageLog } from '@/services/creditsService';
import { UsageDataService } from '@/services/usageDataService';

export const useCreditsSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creditsConfig, setCreditsConfig] = useState<ActionCreditsConfig[]>([]);
  const [creditsHistory, setCreditsHistory] = useState<CreditsUsageLog[]>([]);
  const [userCredits, setUserCredits] = useState<{
    remaining: number;
    used_this_month: number;
    total_per_month: number;
  } | null>(null);

  // Buscar dados do usuário atual
  const refreshUserCredits = useCallback(async () => {
    if (!user) return;

    try {
      const usageData = await UsageDataService.getUserUsage(user.id);
      if (usageData) {
        setUserCredits({
          remaining: usageData.credits_remaining || 0,
          used_this_month: usageData.credits_used_this_month || 0,
          total_per_month: usageData.credits_per_month || 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar créditos do usuário:', error);
    }
  }, [user]);

  // Buscar configurações de créditos
  const loadCreditsConfig = useCallback(async () => {
    try {
      const config = await CreditsService.getCreditsConfig();
      setCreditsConfig(config);
    } catch (error) {
      console.error('Erro ao carregar configuração de créditos:', error);
    }
  }, []);

  // Buscar histórico de créditos
  const loadCreditsHistory = useCallback(async () => {
    if (!user) return;

    try {
      const history = await CreditsService.getUserCreditsHistory(user.id);
      setCreditsHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de créditos:', error);
    }
  }, [user]);

  // Verificar se pode executar uma ação
  const checkCanProceed = useCallback(async (actionType: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para usar esta funcionalidade.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      
      const result = await CreditsService.checkCreditsForAction(user.id, actionType);
      
      if (!result.canProceed) {
        const message = CreditsService.formatCreditsMessage(
          actionType,
          result.creditsRequired,
          result.creditsAvailable,
          false
        );
        
        toast({
          title: "Créditos Insuficientes",
          description: message + " Considere fazer upgrade do seu plano.",
          variant: "destructive",
        });
        return false;
      }

      return true;

    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      toast({
        title: "Erro ao Verificar Créditos",
        description: "Não foi possível verificar seus créditos. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Consumir créditos
  const consumeCredits = useCallback(async (
    actionType: string,
    metadata?: any
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await CreditsService.consumeCredits(user.id, actionType, metadata);
      
      if (result.success) {
        // Atualizar dados locais
        await refreshUserCredits();
        await loadCreditsHistory();
        
        console.log(`✅ ${result.credits_consumed} crédito(s) consumidos para ${actionType}. Restam: ${result.credits_remaining}`);
        return true;
      } else {
        toast({
          title: "Erro ao Consumir Créditos",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }

    } catch (error) {
      console.error('Erro ao consumir créditos:', error);
      toast({
        title: "Erro Interno",
        description: "Erro ao processar créditos. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, refreshUserCredits, loadCreditsHistory]);

  // Calcular estimativas de uso
  const getUsageEstimates = useCallback(() => {
    if (!userCredits || creditsConfig.length === 0) return {};
    
    return CreditsService.calculateUsageEstimate(userCredits.remaining, creditsConfig);
  }, [userCredits, creditsConfig]);

  // Obter custo em créditos de uma ação
  const getActionCreditsCost = useCallback((actionType: string): number => {
    const config = creditsConfig.find(c => c.action_type === actionType);
    return config?.credits_per_action || 0;
  }, [creditsConfig]);

  // Calcular percentual de uso
  const getUsagePercentage = useCallback((): number => {
    if (!userCredits || userCredits.total_per_month === 0) return 0;
    
    return Math.min((userCredits.used_this_month / userCredits.total_per_month) * 100, 100);
  }, [userCredits]);

  // Verificar se está próximo do limite
  const isNearLimit = useCallback((): boolean => {
    return getUsagePercentage() >= 80;
  }, [getUsagePercentage]);

  // Verificar se atingiu o limite
  const isAtLimit = useCallback((): boolean => {
    return !userCredits || userCredits.remaining <= 0;
  }, [userCredits]);

  // Carregar dados iniciais
  useEffect(() => {
    loadCreditsConfig();
  }, [loadCreditsConfig]);

  useEffect(() => {
    if (user) {
      refreshUserCredits();
      loadCreditsHistory();
    }
  }, [user, refreshUserCredits, loadCreditsHistory]);

  return {
    // Estado
    loading,
    userCredits,
    creditsConfig,
    creditsHistory,
    
    // Ações
    checkCanProceed,
    consumeCredits,
    refreshUserCredits,
    loadCreditsHistory,
    
    // Utilitários
    getUsageEstimates,
    getActionCreditsCost,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
  };
};