
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { PLAN_CONFIGS } from '@/types/plans';
import { PlanType } from '@/types/plans';

interface QuickStatsActionsProps {
  onRefresh: () => Promise<void>;
  syncing: boolean;
  plan: PlanType;
  currentLevel: number;
}

const QuickStatsActions = ({ onRefresh, syncing, plan, currentLevel }: QuickStatsActionsProps) => {
  const planConfig = PLAN_CONFIGS[plan];

  return (
    <div className="pt-2 border-t">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Plano: {planConfig.displayName}</span>
        <span>Nível: {currentLevel}</span>
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

export default QuickStatsActions;
