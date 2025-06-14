
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Trophy, Zap } from "lucide-react";

interface QuizHistoryItemProps {
  quiz: {
    id: string;
    resumo_titulo: string;
    total_perguntas: number;
    acertos: number;
    data_criacao: string;
    resumo_id: string;
  };
  onRefazerQuiz: (resumoId: string) => void;
}

const QuizHistoryItem = ({ quiz, onRefazerQuiz }: QuizHistoryItemProps) => {
  const percentage = Math.round((quiz.acertos / quiz.total_perguntas) * 100);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "from-yellow-400 to-orange-500";
    if (percentage >= 80) return "from-blue-400 to-purple-500";
    if (percentage >= 70) return "from-green-400 to-emerald-500";
    if (percentage >= 50) return "from-pink-400 to-rose-500";
    return "from-gray-400 to-gray-500";
  };

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👏";
    if (percentage >= 50) return "💪";
    return "📚";
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-purple-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getPerformanceEmoji(percentage)}</span>
              <h3 className="text-xl font-bold text-gray-800">
                {quiz.resumo_titulo}
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(quiz.data_criacao).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {quiz.acertos}/{quiz.total_perguntas} acertos
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                {percentage}% de aproveitamento
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 bg-gradient-to-r ${getPerformanceColor(percentage)} rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onRefazerQuiz(quiz.resumo_id)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Refazer Quiz
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryItem;
