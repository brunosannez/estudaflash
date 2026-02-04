
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageDataService, type UsageData } from '@/services/usageDataService';
import { useUsageRealTime } from './realtime/useUnifiedRealTime';

export const useUsageData = () => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageData = useCallback(async () => {
    if (!user) {
      console.log('👤 Usuário não autenticado');
      setUsageData(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await UsageDataService.getUserUsage(user.id);
      setUsageData(data);
      
      console.log('✅ Usage data loaded:', data);
    } catch (err) {
      console.error('❌ Error fetching usage data:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time subscription for usage updates
  useUsageRealTime(fetchUsageData);

  useEffect(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  const refreshUsage = useCallback(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  return {
    usageData,
    loading,
    error,
    refreshUsage
  };
};
