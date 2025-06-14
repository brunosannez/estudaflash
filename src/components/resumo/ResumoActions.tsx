
import { Button } from '@/components/ui/button';
import { Brain, Loader2, Wand2, TestTube } from 'lucide-react';

interface ResumoActionsProps {
  onGenerateAutoFlashcards: () => void;
  onManageFlashcards: () => void;
  onGenerateQuiz: () => void;
  isGeneratingFlashcards: boolean;
  isGeneratingQuiz: boolean;
}

const ResumoActions = ({
  onGenerateAutoFlashcards,
  onManageFlashcards,
  onGenerateQuiz,
  isGeneratingFlashcards,
  isGeneratingQuiz
}: ResumoActionsProps) => {
  return (
    <div className="bg-gray-50 p-6 border-t">
      <div className="flex flex-col lg:flex-row gap-4 justify-center">
        <Button 
          onClick={onGenerateAutoFlashcards}
          disabled={isGeneratingFlashcards}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
          size="lg"
        >
          {isGeneratingFlashcards ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando Flashcards...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Gerar Flashcards IA
            </>
          )}
        </Button>
        
        <Button 
          onClick={onManageFlashcards}
          variant="outline"
          className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700"
          size="lg"
        >
          <Brain className="h-5 w-5 mr-2" />
          Gerenciar Flashcards
        </Button>
        
        <Button
          onClick={onGenerateQuiz}
          disabled={isGeneratingQuiz}
          className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
          size="lg"
        >
          {isGeneratingQuiz ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Gerando Quiz...
            </>
          ) : (
            <>
              <TestTube className="h-5 w-5 mr-2" />
              Gerar Quiz IA
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ResumoActions;
