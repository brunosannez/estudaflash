
import { useUnifiedProgress } from './useUnifiedProgress';

export const useRealTimeProgress = () => {
  const unifiedProgress = useUnifiedProgress();
  
  return {
    progress: unifiedProgress.progress,
    todayActivity: unifiedProgress.todayActivity,
    loading: unifiedProgress.loading,
    isInitialized: unifiedProgress.isInitialized,
    getStats: unifiedProgress.getStats,
    refreshProgress: unifiedProgress.refreshProgress
  };
};
