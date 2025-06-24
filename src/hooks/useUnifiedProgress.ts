
import { useEffect } from 'react';
import { useProgressData } from './progress/useProgressData';
import { useProgressStats } from './progress/useProgressStats';
import { useProgressXP } from './progress/useProgressXP';
import { useProgressSubscriptions } from './progress/useProgressSubscriptions';

export const useUnifiedProgress = () => {
  const { data, setData, fetchProgressData } = useProgressData();
  const { getStats } = useProgressStats();
  const { addXP } = useProgressXP(data, setData);

  // Set up subscriptions
  useProgressSubscriptions(data.isInitialized, fetchProgressData);

  // Initial load
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Create a safe getStats function that uses current data
  const safeGetStats = () => getStats(data.progress, data.todayActivity);

  return {
    progress: data.progress,
    todayActivity: data.todayActivity,
    loading: data.loading,
    error: data.error,
    isInitialized: data.isInitialized,
    getStats: safeGetStats,
    addXP,
    refreshProgress: fetchProgressData
  };
};
