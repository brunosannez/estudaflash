
import { Card, CardContent } from '@/components/ui/card';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useStorageManagement } from '@/hooks/useStorageManagement';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { useDataSync } from '@/hooks/useDataSync';
import { PlanType } from '@/types/plans';
import DashboardUsageHeader from './DashboardUsageHeader';
import DashboardUsageItems from './DashboardUsageItems';
import DashboardUsageFooter from './DashboardUsageFooter';
import DashboardUsageLoading from './DashboardUsageLoading';
import DashboardUsageEmpty from './DashboardUsageEmpty';

const DashboardUsageOverview = () => {
  const { usageData, loading: usageLoading, refreshUsage } = useUsageLimit();
  const { storageUsage, loading: storageLoading, getStorageLimitForPlan, getStoragePercentage } = useStorageManagement();
  const { progress, loading: progressLoading } = useRealTimeProgress();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();

  const handleRefresh = async () => {
    console.log('🔄 Sincronização manual solicitada...');
    await forceSyncUserData();
    await refreshUsage();
  };

  const isLoading = usageLoading || storageLoading || progressLoading || syncing;
  const hasNoData = !usageData || (!usageData.uploads_realizados && !usageData.flashcards_gerados && !usageData.quizzes_realizados);

  if (isLoading && !hasInitialized) {
    return <DashboardUsageLoading />;
  }

  if (hasNoData && hasInitialized) {
    return (
      <DashboardUsageEmpty 
        onRefresh={handleRefresh}
        syncing={syncing}
        hasInitialized={hasInitialized}
      />
    );
  }

  if (!usageData || !storageUsage) {
    return (
      <DashboardUsageEmpty 
        onRefresh={handleRefresh}
        syncing={syncing}
        hasInitialized={hasInitialized}
      />
    );
  }

  // Safely convert plano string to PlanType
  const planType = (usageData.plano as PlanType) || 'free';

  return (
    <Card>
      <DashboardUsageHeader 
        planType={planType}
        syncing={syncing}
      />
      <CardContent className="space-y-4">
        <DashboardUsageItems
          usageData={usageData}
          storageUsage={storageUsage}
          getStorageLimitForPlan={getStorageLimitForPlan}
          getStoragePercentage={getStoragePercentage}
          progressXP={progress?.total_xp || 0}
        />
        
        <DashboardUsageFooter
          planType={planType}
          currentLevel={progress?.current_level || 1}
          storageUsage={storageUsage}
          onRefresh={handleRefresh}
          syncing={syncing}
        />
      </CardContent>
    </Card>
  );
};

export default DashboardUsageOverview;
