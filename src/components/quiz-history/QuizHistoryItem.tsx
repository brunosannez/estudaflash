
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Trophy, Zap, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  onDelete?: () => void;
}

const QuizHistoryItem = ({ quiz, onRefazerQuiz, onDelete }: QuizHistoryItemProps) => {
  const percentage = quiz.total_perguntas > 0 ? Math.round((quiz.acertos / quiz.total_perguntas) * 100) : 0;

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

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const handleDeleteQuiz = async () => {
    if (!confirm('Tem certeza que deseja excluir este quiz do histórico?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting quiz session:', quiz.id);
      
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', quiz.id);

      if (error) {
        console.error('❌ Error deleting quiz session:', error);
        throw error;
      }

      console.log('✅ Quiz session deleted successfully');
      toast.success('Quiz excluído do histórico com sucesso!');
      
      // Chamar callback se fornecido
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      toast.error('Erro ao excluir quiz do histórico');
    }
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-purple-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getPerformanceEmoji(percentage)}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {quiz.quiz_titulo}
                </h3>
                <p className="text-sm text-gray-500">
                  Arquivo: {quiz.resumo_titulo}
                </p>
              </div>
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
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(quiz.tempo_conclusao)}
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
            
            <Button
              onClick={handleDeleteQuiz}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryItem;
