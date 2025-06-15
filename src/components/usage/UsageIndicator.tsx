
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, TestTube } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { PLAN_CONFIGS } from '@/types/plans';

const UsageIndicator = () => {
  const { usageData, loading, UpgradeModalComponent } = useUsageLimit();

  if (loading || !usageData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm">Uso do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <>
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
          {usageItems.map((item) => {
            const Icon = item.icon;
            const isNearLimit = item.percentage >= 80;
            const isAtLimit = item.percentage >= 100;
            const limitText = isUnlimited ? '∞' : item.limit.toString();
            
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    {item.current} / {limitText}
                  </span>
                </div>
                {!isUnlimited && (
                  <Progress 
                    value={Math.min(item.percentage, 100)} 
                    className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
                  />
                )}
              </div>
            );
          })}
          
          {!isUnlimited && (
            <div className="pt-2 text-xs text-muted-foreground">
              Resetado a cada 30 dias
            </div>
          )}
        </CardContent>
      </Card>
      
      <UpgradeModalComponent />
    </>
  );
};

export default UsageIndicator;
