
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ProgressSyncHeaderProps {
  totalXp: number;
  onRefresh: () => void;
  loading: boolean;
}

const ProgressSyncHeader = ({ totalXp, onRefresh, loading }: ProgressSyncHeaderProps) => {
  return (
    <div className="bg-muted/50 p-4 rounded-lg border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-green-800">
              Progresso sincronizado em tempo real
            </p>
            <p className="text-xs text-green-600">
              Baseado em {totalXp} XP de todas as suas atividades
            </p>
          </div>
        </div>
        <Button 
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-100"
          disabled={loading}
        >
          <RotateCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
    </div>
  );
};

export default ProgressSyncHeader;
