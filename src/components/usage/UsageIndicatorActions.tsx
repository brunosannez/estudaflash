
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface UsageIndicatorActionsProps {
  onManualSync: () => Promise<void>;
  syncing: boolean;
  isUnlimited: boolean;
}

const UsageIndicatorActions = ({ onManualSync, syncing, isUnlimited }: UsageIndicatorActionsProps) => {
  return (
    <div className="pt-2 border-t flex items-center justify-between">
      {!isUnlimited && (
        <div className="text-xs text-muted-foreground">
          Resetado a cada 30 dias
        </div>
      )}
      <Button 
        onClick={onManualSync}
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
  );
};

export default UsageIndicatorActions;
