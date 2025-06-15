
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataManagementService, type DataManagementStats } from '@/services/dataManagementService';

export const useDataManagement = () => {
  const [stats, setStats] = useState<DataManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const { toast } = useToast();

  const loadSystemStats = async (useCache = false) => {
    try {
      setLoading(!useCache);
      console.log('📊 useDataManagement: Carregando estatísticas...');

      const statsData = await DataManagementService.getManagementStats(useCache);
      setStats(statsData);
      setLastUpdated(new Date());
      console.log('✅ useDataManagement: Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('❌ useDataManagement: Erro ao carregar estatísticas:', error);
      toast({
        title: "Aviso",
        description: "Algumas estatísticas podem estar indisponíveis temporariamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const forceRefresh = async () => {
    DataManagementService.invalidateCache();
    await loadSystemStats(false);
  };

  const setupRealTimeUpdates = () => {
    console.log('🔄 useDataManagement: Configurando atualizações em tempo real...');
    
    const channel = supabase
      .channel('data-management-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uploads',
        },
        (payload) => {
          console.log('🔄 useDataManagement: Upload alterado, atualizando estatísticas...', payload);
          DataManagementService.invalidateCache();
          setTimeout(() => loadSystemStats(false), 1000);
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
          console.log('🔄 useDataManagement: Usuário alterado, atualizando estatísticas...', payload);
          DataManagementService.invalidateCache();
          setTimeout(() => loadSystemStats(false), 1000);
        }
      )
      .subscribe((status) => {
        console.log('📡 useDataManagement: Status do realtime:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    loadSystemStats();
    const cleanup = setupRealTimeUpdates();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadSystemStats(true); // usar cache
    }, 30000);

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, []);

  return {
    stats,
    loading,
    lastUpdated,
    isRealTimeConnected,
    loadSystemStats,
    forceRefresh
  };
};
