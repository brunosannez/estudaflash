
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, TestTube } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';

const UsageIndicator = () => {
  const { usageData, loading } = useUsageLimit();

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

  const isPremium = usageData.plano === 'premium';
  const limit = isPremium ? 'Ilimitado' : '10';

  const usageItems = [
    {
      icon: Upload,
      label: 'Uploads',
      current: usageData.uploads_realizados,
      limit,
      percentage: isPremium ? 0 : (usageData.uploads_realizados / 10) * 100,
      color: 'text-blue-600',
    },
    {
      icon: Brain,
      label: 'Flashcards',
      current: usageData.flashcards_gerados,
      limit,
      percentage: isPremium ? 0 : (usageData.flashcards_gerados / 10) * 100,
      color: 'text-green-600',
    },
    {
      icon: TestTube,
      label: 'Quizzes',
      current: usageData.quizzes_realizados,
      limit,
      percentage: isPremium ? 0 : (usageData.quizzes_realizados / 10) * 100,
      color: 'text-purple-600',
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Uso do Plano</CardTitle>
          <Badge variant={isPremium ? 'default' : 'secondary'}>
            {usageData.plano.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => {
          const Icon = item.icon;
          const isNearLimit = item.percentage >= 80;
          const isAtLimit = item.percentage >= 100;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {item.current} / {item.limit}
                </span>
              </div>
              {!isPremium && (
                <Progress 
                  value={Math.min(item.percentage, 100)} 
                  className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
                />
              )}
            </div>
          );
        })}
        
        {!isPremium && (
          <div className="pt-2 text-xs text-muted-foreground">
            Resetado a cada 30 dias
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageIndicator;
