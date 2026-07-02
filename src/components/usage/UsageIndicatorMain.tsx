
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Upload, Brain, TestTube, Crown } from 'lucide-react';
import { UsageData } from '@/services/usageDataService';

interface UsageIndicatorMainProps {
  usageData: UsageData;
  onManualSync: () => void;
  syncing: boolean;
}

const UsageIndicatorMain = ({ usageData, onManualSync, syncing }: UsageIndicatorMainProps) => {
  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isUnlimited = (limit: number) => limit === -1 || limit === Infinity;

  const usageItems = [
    {
      icon: Upload,
      label: 'Uploads',
      current: usageData.uploads_realizados,
      limit: usageData.uploads_limit,
      color: 'text-primary'
    },
    {
      icon: Brain,
      label: 'Flashcards',
      current: usageData.flashcards_gerados,
      limit: usageData.flashcards_limit,
      color: 'text-green-600'
    },
    {
      icon: TestTube,
      label: 'Quizzes',
      current: usageData.quizzes_realizados,
      limit: usageData.quizzes_limit,
      color: 'text-primary'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Plano {usageData.plan_name || usageData.plano.toUpperCase()}
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onManualSync}
            disabled={syncing}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => {
          const percentage = isUnlimited(item.limit) ? 0 : (item.current / item.limit) * 100;
          const Icon = item.icon;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-muted-foreground">
                  {item.current} / {isUnlimited(item.limit) ? '∞' : item.limit}
                </span>
              </div>
              {!isUnlimited(item.limit) && (
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${getUsageColor(percentage)}`}
                />
              )}
              {percentage >= 90 && !isUnlimited(item.limit) && (
                <p className="text-xs text-red-600 font-medium">
                  ⚠️ Próximo do limite!
                </p>
              )}
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Última atualização: {new Date(usageData.updated_at).toLocaleString('pt-BR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageIndicatorMain;
