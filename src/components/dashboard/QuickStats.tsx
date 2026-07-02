
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Upload, Brain, TestTube, Trophy } from 'lucide-react';
import { useUsageData } from '@/hooks/useUsageData';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { useDataSync } from '@/hooks/useDataSync';
import QuickStatsHeader from './QuickStatsHeader';
import QuickStatsLoading from './QuickStatsLoading';
import QuickStatsEmpty from './QuickStatsEmpty';
import QuickStatsUsageItem from './QuickStatsUsageItem';
import QuickStatsActions from './QuickStatsActions';
import { PlanType } from '@/types/plans';

const QuickStats = () => {
  const { usageData, loading: usageLoading, refreshUsage } = useUsageData();
  const { progress, loading: progressLoading } = useRealTimeProgress();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();

  const handleRefresh = async () => {
    console.log('🔄 Sincronização manual solicitada...');
    await forceSyncUserData();
    await refreshUsage();
  };

  const isLoading = usageLoading || progressLoading || syncing;
  const hasNoData = !usageData;

  if (isLoading && !hasInitialized) {
    return <QuickStatsLoading />;
  }

  if (hasNoData && hasInitialized) {
    return <QuickStatsEmpty onRefresh={handleRefresh} syncing={syncing} hasInitialized={hasInitialized} />;
  }

  if (!usageData) {
    return <QuickStatsEmpty onRefresh={handleRefresh} syncing={syncing} hasInitialized={hasInitialized} />;
  }

  const isUnlimited = (limit: number) => limit === -1 || limit === Infinity;

  const usageItems = [
    {
      icon: Upload,
      label: 'Uploads',
      current: usageData.uploads_realizados,
      limit: usageData.uploads_limit,
      percentage: isUnlimited(usageData.uploads_limit) ? 0 : (usageData.uploads_realizados / usageData.uploads_limit) * 100,
      color: 'text-primary',
    },
    {
      icon: Brain,
      label: 'Flashcards',
      current: usageData.flashcards_gerados,
      limit: usageData.flashcards_limit,
      percentage: isUnlimited(usageData.flashcards_limit) ? 0 : (usageData.flashcards_gerados / usageData.flashcards_limit) * 100,
      color: 'text-green-600',
    },
    {
      icon: TestTube,
      label: 'Quizzes',
      current: usageData.quizzes_realizados,
      limit: usageData.quizzes_limit,
      percentage: isUnlimited(usageData.quizzes_limit) ? 0 : (usageData.quizzes_realizados / usageData.quizzes_limit) * 100,
      color: 'text-primary',
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

  // Convert plan string to PlanType with fallback
  const planType = (usageData.plano === 'free' || usageData.plano === 'pro' || usageData.plano === 'edu') 
    ? usageData.plano as PlanType 
    : 'free' as PlanType;

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
            isUnlimited={isUnlimited(item.limit || 0)}
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
