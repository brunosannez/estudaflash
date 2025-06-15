
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, Brain, TestTube, HardDrive, RefreshCw, AlertTriangle, Trophy } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useStorageManagement } from '@/hooks/useStorageManagement';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';
import { useDataSync } from '@/hooks/useDataSync';
import { PLAN_CONFIGS } from '@/types/plans';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DashboardUsageOverview = () => {
  const { usageData, loading: usageLoading, refreshUsage } = useUsageLimit();
  const { storageUsage, loading: storageLoading, getStorageLimitForPlan, getStoragePercentage, isStorageNearLimit, isStorageAtLimit } = useStorageManagement();
  const { progress, loading: progressLoading } = useRealTimeProgress();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();

  const handleRefresh = async () => {
    console.log('🔄 Sincronização manual solicitada...');
    await forceSyncUserData();
    await refreshUsage();
  };

  const isLoading = usageLoading || storageLoading || progressLoading || syncing;
  const hasNoData = !usageData || (!usageData.uploads_realizados && !usageData.flashcards_gerados && !usageData.quizzes_realizados);

  if (isLoading && !hasInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasNoData && hasInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Dados não sincronizados. Clique para atualizar.
            </AlertDescription>
          </Alert>
          
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
        </CardContent>
      </Card>
    );
  }

  if (!usageData || !storageUsage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">Carregando dados...</p>
            <Button 
              onClick={handleRefresh}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
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

  // Storage calculations
  const limitMB = getStorageLimitForPlan(usageData.plano);
  const usedMB = storageUsage.total_size_mb;
  const storagePercentage = getStoragePercentage(usedMB, usageData.plano);
  const isStorageNear = isStorageNearLimit(usedMB, usageData.plano);
  const isStorageAt = isStorageAtLimit(usedMB, usageData.plano);

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
      icon: HardDrive,
      label: 'Armazenamento',
      current: usedMB,
      limit: limitMB,
      percentage: storagePercentage,
      color: 'text-orange-600',
      unit: 'MB'
    },
    {
      icon: Trophy,
      label: 'XP Total',
      current: progress?.total_xp || 0,
      limit: null,
      percentage: 0,
      color: 'text-yellow-600',
      unit: 'XP'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            📊 Estatísticas de Uso
            {syncing && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
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
          const limitText = isUnlimited && item.limit ? '∞' : (item.limit?.toString() || '');
          const showProgress = item.limit && !isUnlimited;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="font-medium">{item.label}</span>
                  {(isNearLimit || isAtLimit) && item.limit && (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
                <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {item.current}{item.unit ? ` ${item.unit}` : ''}{item.limit ? ` / ${limitText}${item.unit ? ` ${item.unit}` : ''}` : ''}
                </span>
              </div>
              {showProgress && (
                <Progress 
                  value={Math.min(item.percentage, 100)} 
                  className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
                />
              )}
            </div>
          );
        })}
        
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Plano: {planConfig.displayName}</span>
            <span>Nível: {progress?.current_level || 1}</span>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>📁 {storageUsage.total_files} arquivo{storageUsage.total_files !== 1 ? 's' : ''}</div>
            {usageData.plano === 'free' && (
              <div className="text-orange-600">
                ⏰ Limites resetam a cada 30 dias
              </div>
            )}
            {usageData.plano === 'pro' && (
              <div className="text-blue-600">
                📚 10x mais limite que o plano gratuito
              </div>
            )}
            {usageData.plano === 'edu' && (
              <div className="text-green-600">
                ♾️ Recursos ilimitados
              </div>
            )}
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

export default DashboardUsageOverview;
