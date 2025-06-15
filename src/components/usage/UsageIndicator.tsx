
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, TestTube, RefreshCw, AlertCircle } from 'lucide-react';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { PLAN_CONFIGS } from '@/types/plans';
import UpgradeModal from '@/components/usage/UpgradeModal';
import StorageIndicator from './StorageIndicator';
import { Button } from '@/components/ui/button';
import { useDataSync } from '@/hooks/useDataSync';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UsageIndicator = () => {
  const { usageData, loading, upgradeModalData, refreshUsage } = useUsageLimit();
  const { forceSyncUserData, syncing, hasInitialized } = useDataSync();

  const handleManualSync = async () => {
    await forceSyncUserData();
    await refreshUsage();
  };

  const hasNoData = !usageData || (!usageData.uploads_realizados && !usageData.flashcards_gerados && !usageData.quizzes_realizados);

  if (loading && !hasInitialized) {
    return (
      <div className="space-y-4">
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
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm">Armazenamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasNoData && hasInitialized) {
    return (
      <div className="space-y-4">
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Uso do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Dados não sincronizados. Clique para atualizar.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleManualSync}
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
                  Sincronizar Dados
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        <StorageIndicator />
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="space-y-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-sm">Uso do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">Carregando dados...</p>
              <Button 
                onClick={handleManualSync}
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
        <StorageIndicator />
      </div>
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
    <div className="space-y-4">
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
          
          <div className="pt-2 border-t flex items-center justify-between">
            {!isUnlimited && (
              <div className="text-xs text-muted-foreground">
                Resetado a cada 30 dias
              </div>
            )}
            <Button 
              onClick={handleManualSync}
              disabled={syncing}
              variant="ghost"
              size="sm"
              className="ml-auto"
            >
              {syncing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <StorageIndicator />
      
      <UpgradeModal
        isOpen={upgradeModalData.isOpen}
        onClose={upgradeModalData.onClose}
        currentPlan={upgradeModalData.currentPlan}
        actionType={upgradeModalData.actionType}
      />
    </div>
  );
};

export default UsageIndicator;
