
import { useEffect } from 'react';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import ProgressLoading from './progress/ProgressLoading';
import ProgressEmpty from './progress/ProgressEmpty';
import ProgressSyncHeader from './progress/ProgressSyncHeader';
import ProgressStatsGrid from './progress/ProgressStatsGrid';
import ProgressLevelDetails from './progress/ProgressLevelDetails';
import ProgressStreakDetails from './progress/ProgressStreakDetails';

const ProgressOverview = () => {
  const { progress, todayActivity, loading, isInitialized, getStats, refreshProgress } = useRealTimeProgress();

  useEffect(() => {
    if (!isInitialized) {
      refreshProgress();
    }
  }, [isInitialized]);

  const stats = getStats();

  console.log('🎯 ProgressOverview render:', { loading, isInitialized, stats, progress, todayActivity });

  if (loading || !isInitialized) {
    return <ProgressLoading />;
  }

  if (!stats) {
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
