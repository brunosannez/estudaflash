
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
    console.log('🔄 Sincronização manual solicitada no dashboard...');
    try {
      await forceSyncUserData();
      await refreshUsage();
      console.log('✅ Sincronização manual completa');
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
    }
  };

  const isLoading = usageLoading || storageLoading || progressLoading || syncing;
  
  // More specific check for no data
  const hasUsageData = usageData && (
    usageData.uploads_realizados > 0 || 
    usageData.flashcards_gerados > 0 || 
    usageData.quizzes_realizados > 0 ||
    usageData.plan_name // At least has plan info
  );

  console.log('📊 DashboardUsageOverview state:', {
    isLoading,
    hasInitialized,
    hasUsageData,
    usageData,
    storageUsage
  });

  // Show loading state only during initial load
  if (isLoading && !hasInitialized) {
    return <DashboardUsageLoading />;
  }

  // Show empty state if no usage data and initialized
  if (!hasUsageData && hasInitialized) {
    return (
      <DashboardUsageEmpty 
        onRefresh={handleRefresh}
        syncing={syncing}
        hasInitialized={hasInitialized}
      />
    );
  }

  // Show empty state if critical data is missing
  if (!usageData || !storageUsage) {
    return (
      <DashboardUsageEmpty 
        onRefresh={handleRefresh}
        syncing={syncing}
        hasInitialized={hasInitialized}
      />
    );
  }

  // Safely convert plano string to PlanType with fallback
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
