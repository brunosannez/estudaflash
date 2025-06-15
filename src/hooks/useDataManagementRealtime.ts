
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataManagementService, type DataManagementStats } from '@/services/dataManagementService';

export const useDataManagementRealtime = () => {
  const [stats, setStats] = useState<DataManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  const loadStats = async (useCache = false) => {
    try {
      setLoading(!useCache);
      console.log('📊 useDataManagementRealtime: Carregando estatísticas...');

      const statsData = await DataManagementService.getManagementStats(useCache);
      setStats(statsData);
      setLastUpdated(new Date());
      console.log('✅ useDataManagementRealtime: Estatísticas carregadas');
    } catch (error) {
      console.error('❌ useDataManagementRealtime: Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    DataManagementService.invalidateCache();
    await loadStats(false);
  };

  useEffect(() => {
    loadStats();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadStats(true);
    }, 30000);

    // Setup realtime
    const channel = supabase
      .channel('data-management-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uploads',
        },
        (payload) => {
          console.log('🔄 Realtime: Upload alterado', payload);
          DataManagementService.invalidateCache();
          setTimeout(() => loadStats(false), 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios',
        },
        (payload) => {
          console.log('🔄 Realtime: Usuário alterado', payload);
          DataManagementService.invalidateCache();
          setTimeout(() => loadStats(false), 1000);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    lastUpdated,
    isRealTimeConnected,
    loadStats,
    forceRefresh
  };
};
