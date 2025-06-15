
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { PLAN_CONFIGS } from '@/types/plans';
import { PlanType } from '@/types/plans';

interface DashboardUsageHeaderProps {
  planType: PlanType;
  syncing: boolean;
}

const DashboardUsageHeader = ({ planType, syncing }: DashboardUsageHeaderProps) => {
  // Add fallback to 'free' if planType is not found in PLAN_CONFIGS
  const planConfig = PLAN_CONFIGS[planType] || PLAN_CONFIGS.free;

  return (
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
  );
};

export default DashboardUsageHeader;
