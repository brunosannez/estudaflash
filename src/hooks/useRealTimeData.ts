
import { useEffect } from 'react';
import { useRealTimeStats } from './realtime/useRealTimeStats';
import { useRealTimeSubscriptions } from './realtime/useRealTimeSubscriptions';

export const useRealTimeData = () => {
  const { stats, refreshStats } = useRealTimeStats();

  // Initial load
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Set up real-time subscriptions
  useRealTimeSubscriptions(refreshStats);

  return {
    stats,
    refreshStats
  };
};
