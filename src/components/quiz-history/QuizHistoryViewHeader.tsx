
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface QuizHistoryViewHeaderProps {
  onBack: () => void;
}

const QuizHistoryViewHeader = ({ onBack }: QuizHistoryViewHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={onBack}
        variant="ghost" 
        size="sm"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Detalhes do Quiz
        </h1>
        <p className="text-muted-foreground">Revisão completa de questões e respostas</p>
      </div>
    </div>
  );
};

export default QuizHistoryViewHeader;
