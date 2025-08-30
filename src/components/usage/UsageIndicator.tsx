
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useDataSync } from '@/hooks/useDataSync';
import { useState } from 'react';
import UpgradeModal from '@/components/usage/UpgradeModal';
import StorageIndicator from './StorageIndicator';
import CreditsIndicator from './CreditsIndicator';
import CreditsHistoryModal from './CreditsHistoryModal';
import UsageIndicatorLoading from './UsageIndicatorLoading';
import UsageIndicatorEmpty from './UsageIndicatorEmpty';
import UsageIndicatorMain from './UsageIndicatorMain';

const UsageIndicator = () => {
  const { usageData, userCredits, loading, upgradeModalData, refreshUsage } = useUsageLimit();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();
  const [showCreditsHistory, setShowCreditsHistory] = useState(false);

  const handleManualSync = async () => {
    await forceSyncUserData();
    await refreshUsage();
  };

  const handleUpgrade = () => {
    if (upgradeModalData.onClose) {
      upgradeModalData.onClose();
    }
  };

  const handleViewHistory = () => {
    setShowCreditsHistory(true);
  };

  const shouldShowCredits = userCredits && userCredits.total_per_month > 0;
  const hasNoData = !usageData || (!usageData.uploads_realizados && !usageData.flashcards_gerados && !usageData.quizzes_realizados);

  if (loading && !hasInitialized) {
    return <UsageIndicatorLoading />;
  }

  return (
    <div className="space-y-4">
      {shouldShowCredits ? (
        <CreditsIndicator 
          onUpgrade={handleUpgrade}
          onViewHistory={handleViewHistory}
        />
      ) : (
        <>
          {hasNoData && hasInitialized ? (
            <UsageIndicatorEmpty 
              onManualSync={handleManualSync}
              syncing={syncing}
              hasInitialized={hasInitialized}
            />
          ) : usageData ? (
            <UsageIndicatorMain 
              usageData={usageData}
              onManualSync={handleManualSync}
              syncing={syncing}
            />
          ) : (
            <UsageIndicatorEmpty 
              onManualSync={handleManualSync}
              syncing={syncing}
              hasInitialized={hasInitialized}
            />
          )}
        </>
      )}
      
      <StorageIndicator />
      
      <UpgradeModal
        isOpen={upgradeModalData.isOpen}
        onClose={upgradeModalData.onClose}
        currentPlan={upgradeModalData.currentPlan}
        actionType={upgradeModalData.actionType}
      />

      <CreditsHistoryModal 
        isOpen={showCreditsHistory}
        onClose={() => setShowCreditsHistory(false)}
      />
    </div>
  );
};

export default UsageIndicator;
