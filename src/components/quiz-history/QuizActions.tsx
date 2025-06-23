
import { Button } from "@/components/ui/button";
import { Eye, Zap, Trash2 } from "lucide-react";

interface QuizActionsProps {
  quiz: {
    id: string;
    resumo_id: string;
  };
  onRefazerQuiz: (resumoId: string) => void;
  onViewQuiz?: (quiz: any) => void;
  onDelete: () => Promise<void>;
}

const QuizActions = ({ quiz, onRefazerQuiz, onViewQuiz, onDelete }: QuizActionsProps) => {
  return (
    <div className="flex gap-3">
      {onViewQuiz && (
        <Button
          onClick={() => onViewQuiz(quiz)}
          variant="outline"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
      )}
      
      <Button
        onClick={() => onRefazerQuiz(quiz.resumo_id)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        <Zap className="h-4 w-4 mr-2" />
        Refazer Quiz
      </Button>
      
      <Button
        onClick={onDelete}
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Excluir
      </Button>
    </div>
  );
};

export default QuizActions;
