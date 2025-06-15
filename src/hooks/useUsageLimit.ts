
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UsageLimitService, type ActionType, type UsageData } from '@/services/usageLimitService';
import { PlanType } from '@/types/plans';
import { supabase } from '@/integrations/supabase/client';
import { useDataSync } from '@/hooks/useDataSync';

export const useUsageLimit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { forceSyncUserData, syncing: syncingData, hasInitialized } = useDataSync();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    actionType: ActionType | null;
    plan: PlanType;
  }>({
    isOpen: false,
    actionType: null,
    plan: 'free',
  });

  const fetchUsageData = async (skipSync = false) => {
    if (!user) {
      setUsageData(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Buscando dados de uso para usuário:', user.id);
      
      // Sempre sincronizar primeiro, a menos que seja explicitamente pulado
      if (!skipSync && hasInitialized) {
        console.log('🔄 Forçando sincronização antes de buscar dados...');
        await forceSyncUserData();
      }
      
      // Buscar dados atualizados
      const data = await UsageLimitService.getUserUsage(user.id);
      console.log('📊 Dados de uso carregados:', data);
      setUsageData(data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados de uso:', error);
      // Em caso de erro, tentar forçar sincronização
      try {
        console.log('🔄 Tentando sincronização de emergência...');
        await forceSyncUserData();
        const data = await UsageLimitService.getUserUsage(user.id);
        setUsageData(data);
      } catch (syncError) {
        console.error('❌ Erro na sincronização de emergência:', syncError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o usuário está disponível ou quando a sincronização for concluída
  useEffect(() => {
    if (user && hasInitialized) {
      fetchUsageData();
    }
  }, [user, hasInitialized]);

  // Listener para mudanças na tabela uso_usuarios
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`usage-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Dados de uso alterados, atualizando...', payload);
          // Usar skipSync para evitar loop infinito
          setTimeout(() => fetchUsageData(true), 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const manualRefresh = async () => {
    console.log('🔄 Atualização manual solicitada...');
    await forceSyncUserData();
    await fetchUsageData(true);
  };

  return {
    usageData,
    loading: loading || syncingData,
    checkCanProceed,
    incrementUsage,
    getUsagePercentage,
    refreshUsage: manualRefresh,
    upgradeModalData: {
      isOpen: upgradeModal.isOpen,
      onClose: closeUpgradeModal,
      currentPlan: upgradeModal.plan,
      actionType: upgradeModal.actionType || '',
    },
  };
};
