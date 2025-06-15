
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface ProgressEmptyProps {
  onRefresh: () => void;
}

const ProgressEmpty = ({ onRefresh }: ProgressEmptyProps) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎮</div>
        <p className="text-lg font-semibold text-gray-600">Comece a estudar para ver seu progresso!</p>
        <div className="text-sm text-gray-500 mb-4">
          Complete flashcards ou quizzes para ganhar XP e começar seu streak
        </div>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Sincronizar
          </Button>
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressEmpty;
