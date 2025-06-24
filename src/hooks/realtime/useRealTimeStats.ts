
import { useState, useCallback } from 'react';
import { StatsData, useStatsCalculation } from './useStatsCalculation';

interface RealTimeStats extends StatsData {
  loading: boolean;
  error: string | null;
}

export const useRealTimeStats = () => {
  const [stats, setStats] = useState<RealTimeStats>({
    totalSummaries: 0,
    totalQuizzes: 0,
    totalFlashcards: 0,
    recentActivity: [],
    loading: true,
    error: null
  });

  const { fetchStats } = useStatsCalculation();

  const refreshStats = useCallback(async () => {
    try {
      console.log('📊 Fetching real-time stats...');
      
      const statsData = await fetchStats();

      setStats({
        ...statsData,
        loading: false,
        error: null
      });

      console.log('✅ Real-time stats updated successfully');

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar dados'
      }));
    }
  }, [fetchStats]);

  return {
    stats,
    refreshStats
  };
};
