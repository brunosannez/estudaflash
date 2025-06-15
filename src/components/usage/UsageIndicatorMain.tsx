
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, TestTube } from 'lucide-react';
import { UsageData } from '@/services/usageLimitService';
import { PLAN_CONFIGS } from '@/types/plans';
import UsageIndicatorItem from './UsageIndicatorItem';
import UsageIndicatorActions from './UsageIndicatorActions';

interface UsageIndicatorMainProps {
  usageData: UsageData;
  onManualSync: () => Promise<void>;
  syncing: boolean;
}

const UsageIndicatorMain = ({ usageData, onManualSync, syncing }: UsageIndicatorMainProps) => {
  const planConfig = PLAN_CONFIGS[usageData.plano];
  const isUnlimited = usageData.plano === 'edu';

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
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Uso do Plano</CardTitle>
          <Badge variant={planConfig.badgeVariant} className={planConfig.color}>
            {planConfig.displayName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => (
          <UsageIndicatorItem
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
        
        <UsageIndicatorActions
          onManualSync={onManualSync}
          syncing={syncing}
          isUnlimited={isUnlimited}
        />
      </CardContent>
    </Card>
  );
};

export default UsageIndicatorMain;
