
import { Card, CardContent } from "@/components/ui/card";
import QuizPerformanceIndicator from "./QuizPerformanceIndicator";
import QuizMetrics from "./QuizMetrics";
import QuizActions from "./QuizActions";
import MindMapButton from "./MindMapButton";
import { useQuizDeleteHandler } from "./QuizDeleteHandler";

interface QuizHistoryItemProps {
  quiz: {
    id: string;
    resumo_titulo: string;
    total_perguntas: number;
    acertos: number;
    data_criacao: string;
    resumo_id: string;
    quiz_titulo: string;
    tempo_conclusao: number;
  };
  onRefazerQuiz: (resumoId: string) => void;
  onViewQuiz?: (quiz: any) => void;
  onDelete?: () => void;
}

const QuizHistoryItem = ({ quiz, onRefazerQuiz, onViewQuiz, onDelete }: QuizHistoryItemProps) => {
  const { deleteQuizSession } = useQuizDeleteHandler();
  const percentage = quiz.total_perguntas > 0 ? Math.round((quiz.acertos / quiz.total_perguntas) * 100) : 0;

  const handleDeleteQuiz = async () => {
    const success = await deleteQuizSession(quiz.id);
    if (success && onDelete) {
      onDelete();
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-border hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {quiz.quiz_titulo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Arquivo: {quiz.resumo_titulo}
                </p>
              </div>
              
              <QuizPerformanceIndicator percentage={percentage} />
              <QuizMetrics quiz={quiz} percentage={percentage} />
            </div>

            <div className="flex flex-col gap-2">
              <QuizActions
                quiz={quiz}
                onRefazerQuiz={onRefazerQuiz}
                onViewQuiz={onViewQuiz}
                onDelete={handleDeleteQuiz}
              />
              
              <MindMapButton
                resumoId={quiz.resumo_id}
                resumoContent={`Resumo do arquivo: ${quiz.resumo_titulo}`}
                resumoTitulo={quiz.resumo_titulo}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryItem;
