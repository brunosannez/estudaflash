
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Loader2 } from 'lucide-react';
import { PLAN_CONFIGS } from '@/types/plans';
import { UsageData } from '@/services/usageLimitService';

interface QuickStatsHeaderProps {
  usageData: UsageData;
  syncing: boolean;
}

const QuickStatsHeader = ({ usageData, syncing }: QuickStatsHeaderProps) => {
  const planConfig = PLAN_CONFIGS[usageData.plano];

  return (
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
  );
};

export default QuickStatsHeader;
