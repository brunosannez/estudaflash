
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { useStorageManagement } from '@/hooks/useStorageManagement';
import { useUsageLimit } from '@/hooks/useUsageLimit';

const StorageIndicator = () => {
  const { storageUsage, loading, getStorageLimitForPlan, getStoragePercentage, isStorageNearLimit, isStorageAtLimit } = useStorageManagement();
  const { usageData } = useUsageLimit();

  if (loading || !storageUsage || !usageData) {
    return (
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
    );
  }

  const limitMB = getStorageLimitForPlan(usageData.plano);
  const usedMB = storageUsage.total_size_mb;
  const percentage = getStoragePercentage(usedMB, usageData.plano);
  const isNearLimit = isStorageNearLimit(usedMB, usageData.plano);
  const isAtLimit = isStorageAtLimit(usedMB, usageData.plano);
  const isUnlimited = usageData.plano === 'edu';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Armazenamento</CardTitle>
          {(isNearLimit || isAtLimit) && !isUnlimited && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {isAtLimit ? 'Cheio' : 'Quase cheio'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Espaço usado</span>
            </div>
            <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              {usedMB} MB / {isUnlimited ? '∞' : `${limitMB} MB`}
            </span>
          </div>
          {!isUnlimited && (
            <Progress 
              value={Math.min(percentage, 100)} 
              className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
            />
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>📁 {storageUsage.total_files} arquivo{storageUsage.total_files !== 1 ? 's' : ''}</div>
          {usageData.plano === 'free' && (
            <div className="text-orange-600">
              ⏰ Arquivos deletados após 30 dias
            </div>
          )}
          {usageData.plano === 'pro' && (
            <div className="text-blue-600">
              📚 Armazenamento por 90 dias
            </div>
          )}
          {usageData.plano === 'edu' && (
            <div className="text-green-600">
              ♾️ Armazenamento ilimitado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageIndicator;
