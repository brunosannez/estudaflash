
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useDataSync } from '@/hooks/useDataSync';
import UpgradeModal from '@/components/usage/UpgradeModal';
import StorageIndicator from './StorageIndicator';
import UsageIndicatorLoading from './UsageIndicatorLoading';
import UsageIndicatorEmpty from './UsageIndicatorEmpty';
import UsageIndicatorMain from './UsageIndicatorMain';

const UsageIndicator = () => {
  const { usageData, loading, upgradeModalData, refreshUsage } = useUsageLimit();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();

  const handleManualSync = async () => {
    await forceSyncUserData();
    await refreshUsage();
  };

  const hasNoData = !usageData || (!usageData.uploads_realizados && !usageData.flashcards_gerados && !usageData.quizzes_realizados);

  if (loading && !hasInitialized) {
    return <UsageIndicatorLoading />;
  }

  if (hasNoData && hasInitialized) {
    return (
      <UsageIndicatorEmpty 
        onManualSync={handleManualSync}
        syncing={syncing}
        hasInitialized={hasInitialized}
      />
    );
  }

  if (!usageData) {
    return (
      <UsageIndicatorEmpty 
        onManualSync={handleManualSync}
        syncing={syncing}
        hasInitialized={hasInitialized}
      />
    );
  }

  return (
    <div className="space-y-4">
      <UsageIndicatorMain 
        usageData={usageData}
        onManualSync={handleManualSync}
        syncing={syncing}
      />
      
      <StorageIndicator />
      
      <UpgradeModal
        isOpen={upgradeModalData.isOpen}
        onClose={upgradeModalData.onClose}
        currentPlan={upgradeModalData.currentPlan}
        actionType={upgradeModalData.actionType}
      />
    </div>
  );
};

export default UsageIndicator;
