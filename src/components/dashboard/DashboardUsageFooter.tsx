
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { PLAN_CONFIGS } from '@/types/plans';
import { PlanType } from '@/types/plans';
import { StorageUsage } from '@/hooks/useStorageManagement';

interface DashboardUsageFooterProps {
  planType: PlanType;
  currentLevel: number;
  storageUsage: StorageUsage;
  onRefresh: () => Promise<void>;
  syncing: boolean;
}

const DashboardUsageFooter = ({ 
  planType, 
  currentLevel, 
  storageUsage, 
  onRefresh, 
  syncing 
}: DashboardUsageFooterProps) => {
  const planConfig = PLAN_CONFIGS[planType];

  return (
    <div className="pt-4 border-t space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Plano: {planConfig.displayName}</span>
        <span>Nível: {currentLevel}</span>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <div>📁 {storageUsage.total_files} arquivo{storageUsage.total_files !== 1 ? 's' : ''}</div>
        {planType === 'free' && (
          <div className="text-orange-600">
            ⏰ Limites resetam a cada 30 dias
          </div>
        )}
        {planType === 'pro' && (
          <div className="text-blue-600">
            📚 10x mais limite que o plano gratuito
          </div>
        )}
        {planType === 'edu' && (
          <div className="text-green-600">
            ♾️ Recursos ilimitados
          </div>
        )}
      </div>

      <Button 
        onClick={onRefresh}
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
  );
};

export default DashboardUsageFooter;
