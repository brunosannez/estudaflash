
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Brain, Target, Trophy } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { PLAN_CONFIGS } from '@/types/plans';

const QuickStats = () => {
  const { usageData, loading: usageLoading } = useUsageLimit();
  const { progress, loading: progressLoading } = useRealTimeProgress();

  if (usageLoading || progressLoading || !usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
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

  const stats = [
    {
      icon: Upload,
      label: 'Uploads',
      value: usageData.uploads_realizados,
      limit: planConfig.uploads,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Brain,
      label: 'Flashcards',
      value: usageData.flashcards_gerados,
      limit: planConfig.flashcards,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Target,
      label: 'Quizzes',
      value: usageData.quizzes_realizados,
      limit: planConfig.quizzes,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Trophy,
      label: 'XP Total',
      value: progress?.total_xp || 0,
      limit: null,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Estatísticas Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const percentage = stat.limit && !isUnlimited ? (stat.value / stat.limit) * 100 : 0;
          const limitText = isUnlimited ? '∞' : stat.limit?.toString() || '';
          
          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {stat.value}{stat.limit ? ` / ${limitText}` : ''}
                </span>
              </div>
              {stat.limit && !isUnlimited && (
                <Progress value={Math.min(percentage, 100)} className="h-2" />
              )}
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Plano: {planConfig.displayName}</span>
            <span>Nível: {progress?.current_level || 1}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
