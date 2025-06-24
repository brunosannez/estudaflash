
import { useEffect } from 'react';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import ProgressLoading from './progress/ProgressLoading';
import ProgressEmpty from './progress/ProgressEmpty';
import ProgressSyncHeader from './progress/ProgressSyncHeader';
import ProgressStatsGrid from './progress/ProgressStatsGrid';
import ProgressLevelDetails from './progress/ProgressLevelDetails';
import ProgressStreakDetails from './progress/ProgressStreakDetails';

const ProgressOverview = () => {
  const { progress, todayActivity, loading, isInitialized, getStats, refreshProgress, error } = useUnifiedProgress();

  useEffect(() => {
    if (!isInitialized) {
      refreshProgress();
    }
  }, [isInitialized, refreshProgress]);

  const stats = getStats();

  console.log('🎯 ProgressOverview render:', { loading, isInitialized, stats, error });

  if (loading || !isInitialized) {
    return <ProgressLoading />;
  }

  if (error || !stats) {
    return <ProgressEmpty onRefresh={refreshProgress} />;
  }

  return (
    <div className="space-y-6">
      <ProgressSyncHeader 
        totalXp={progress?.total_xp || 0}
        onRefresh={refreshProgress}
        loading={loading}
      />

      <ProgressStatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressLevelDetails 
          stats={stats}
          onRefresh={refreshProgress}
          loading={loading}
        />
        <ProgressStreakDetails stats={stats} />
      </div>
    </div>
  );
};

export default ProgressOverview;
