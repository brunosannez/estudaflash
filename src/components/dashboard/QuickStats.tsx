
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Upload, Brain, TestTube, Trophy } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { useDataSync } from '@/hooks/useDataSync';
import { PLAN_CONFIGS, PlanType } from '@/types/plans';
import QuickStatsHeader from './QuickStatsHeader';
import QuickStatsLoading from './QuickStatsLoading';
import QuickStatsEmpty from './QuickStatsEmpty';
import QuickStatsUsageItem from './QuickStatsUsageItem';
import QuickStatsActions from './QuickStatsActions';

const QuickStats = () => {
  const { usageData, loading: usageLoading, refreshUsage } = useUsageLimit();
  const { progress, loading: progressLoading } = useRealTimeProgress();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();

  const handleRefresh = async () => {
    console.log('🔄 Sincronização manual solicitada...');
    await forceSyncUserData();
    await refreshUsage();
  };

  const isLoading = usageLoading || progressLoading || syncing;
  const hasNoData = !usageData || (!usageData.uploads_realizados && !usageData.flashcards_gerados && !usageData.quizzes_realizados);

  if (isLoading && !hasInitialized) {
    return <QuickStatsLoading />;
  }

  if (hasNoData && hasInitialized) {
    return <QuickStatsEmpty onRefresh={handleRefresh} syncing={syncing} hasInitialized={hasInitialized} />;
  }

  if (!usageData) {
    return <QuickStatsEmpty onRefresh={handleRefresh} syncing={syncing} hasInitialized={hasInitialized} />;
  }

  // Safely convert plano string to PlanType
  const planType = (usageData.plano as PlanType) || 'free';
  const planConfig = PLAN_CONFIGS[planType];
  const isUnlimited = planType === 'edu';

  const usageItems = [
    {
      icon: Upload,
      label: 'Uploads',
      current: usageData.uploads_realizados,
      limit: planConfig.uploads,
      percentage: isUnlimited ? 0 : (usageData.uploads_realizados / planConfig.uploads) * 100,
      color: 'text-blue-600',
    },
    {
      icon: Brain,
      label: 'Flashcards',
      current: usageData.flashcards_gerados,
      limit: planConfig.flashcards,
      percentage: isUnlimited ? 0 : (usageData.flashcards_gerados / planConfig.flashcards) * 100,
      color: 'text-green-600',
    },
    {
      icon: TestTube,
      label: 'Quizzes',
      current: usageData.quizzes_realizados,
      limit: planConfig.quizzes,
      percentage: isUnlimited ? 0 : (usageData.quizzes_realizados / planConfig.quizzes) * 100,
      color: 'text-purple-600',
    },
    {
      icon: Trophy,
      label: 'XP Total',
      current: progress?.total_xp || 0,
      limit: null,
      percentage: 0,
      color: 'text-yellow-600',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <QuickStatsHeader usageData={usageData} syncing={syncing} />
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => (
          <QuickStatsUsageItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            current={item.current}
            limit={item.limit}
            percentage={item.percentage}
            color={item.color}
            isUnlimited={isUnlimited}
          />
        ))}
        
        <QuickStatsActions 
          onRefresh={handleRefresh}
          syncing={syncing}
          plan={planType}
          currentLevel={progress?.current_level || 1}
        />
      </CardContent>
    </Card>
  );
};

export default QuickStats;
