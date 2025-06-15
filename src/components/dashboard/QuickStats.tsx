
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, TestTube, Trophy, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { PLAN_CONFIGS } from '@/types/plans';
import { Button } from '@/components/ui/button';
import { useDataSync } from '@/hooks/useDataSync';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Estatísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Sincronizando dados...</p>
              <p className="text-xs text-gray-500">Carregando suas estatísticas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasNoData && hasInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Estatísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Dados ainda não sincronizados. Clique em "Sincronizar" para atualizar.
            </AlertDescription>
          </Alert>
          
          <div className="text-center py-4">
            <div className="mb-4">
              <Trophy className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm font-medium mb-2">Bem-vindo!</p>
            <p className="text-xs text-gray-500 mb-4">Suas estatísticas aparecerão aqui</p>
            
            <Button 
              onClick={handleRefresh}
              disabled={syncing}
              variant="default"
              size="sm"
              className="w-full"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Dados
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Estatísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <Trophy className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm font-medium">Carregando dados...</p>
            <Button 
              onClick={handleRefresh}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Estatísticas Rápidas
            {syncing && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          </CardTitle>
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
          const limitText = isUnlimited ? '∞' : (item.limit?.toString() || '');
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {item.current}{item.limit ? ` / ${limitText}` : ''}
                </span>
              </div>
              {item.limit && !isUnlimited && (
                <Progress 
                  value={Math.min(item.percentage, 100)} 
                  className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
                />
              )}
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>Plano: {planConfig.displayName}</span>
            <span>Nível: {progress?.current_level || 1}</span>
          </div>

          <Button 
            onClick={handleRefresh}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Dados
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickStats;
