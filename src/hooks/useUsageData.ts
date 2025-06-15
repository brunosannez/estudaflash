
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageLimitService, type UsageData } from '@/services/usageLimitService';
import { supabase } from '@/integrations/supabase/client';
import { useDataSync } from '@/hooks/useDataSync';

export const useUsageData = () => {
  const { user } = useAuth();
  const { forceSyncUserData, syncing: syncingData, hasInitialized } = useDataSync();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const manualRefresh = async () => {
    console.log('🔄 Atualização manual solicitada...');
    await forceSyncUserData();
    await fetchUsageData(true);
  };

  return {
    usageData,
    loading: loading || syncingData,
    refreshUsage: manualRefresh,
    fetchUsageData,
  };
};
