
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Play, Pause, CheckCircle, Clock, Brain, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useCallback } from "react";

interface EnhancedQuizHistoryItemProps {
  quiz: {
    session_id: string;
    resumo_id: string;
    resumo_titulo: string;
    quiz_title: string;
    status: 'in_progress' | 'completed' | 'paused';
    total_questions: number;
    correct_answers: number;
    progress_percentage: number;
    created_at: string;
    last_activity_at: string;
    completion_time_seconds?: number;
    can_resume: boolean;
  };
  onResumeQuiz: (sessionId: string) => void;
  onViewQuiz?: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onGenerateMindMap: (resumoId: string, resumoTitulo: string) => void;
}

const EnhancedQuizHistoryItem = ({ 
  quiz, 
  onResumeQuiz, 
  onViewQuiz, 
  onDelete,
  onGenerateMindMap 
}: EnhancedQuizHistoryItemProps) => {
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);

  const getStatusInfo = () => {
    switch (quiz.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Concluído',
          color: 'bg-green-500'
        };
      case 'in_progress':
        return {
          icon: <Play className="h-4 w-4" />,
          label: 'Em Progresso',
          color: 'bg-blue-500'
        };
      case 'paused':
        return {
          icon: <Pause className="h-4 w-4" />,
          label: 'Pausado',
          color: 'bg-yellow-500'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Pendente',
          color: 'bg-gray-500'
        };
    }
  };

  const handleGenerateMindMap = useCallback(async () => {
    if (isGeneratingMindMap) return;
    
    setIsGeneratingMindMap(true);
    try {
      await onGenerateMindMap(quiz.resumo_id, quiz.resumo_titulo);
    } finally {
      setIsGeneratingMindMap(false);
    }
  }, [onGenerateMindMap, quiz.resumo_id, quiz.resumo_titulo, isGeneratingMindMap]);

  const statusInfo = getStatusInfo();
  const accuracy = quiz.total_questions > 0 ? Math.round((quiz.correct_answers / quiz.total_questions) * 100) : 0;
  const lastActivity = formatDistanceToNow(new Date(quiz.last_activity_at), { 
    addSuffix: true, 
    locale: ptBR 
  });

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100 hover:border-purple-200">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-800">
                  {quiz.quiz_title}
                </h3>
                <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">
                Arquivo: {quiz.resumo_titulo}
              </p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(quiz.progress_percentage)}%</span>
                </div>
                <Progress value={quiz.progress_percentage} className="h-2" />
              </div>

              {/* Quiz Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600">{quiz.correct_answers}</div>
                  <div className="text-gray-600">Acertos</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="font-bold text-purple-600">{quiz.total_questions}</div>
                  <div className="text-gray-600">Questões</div>
                </div>
                {quiz.status === 'completed' && (
                  <>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600">{accuracy}%</div>
                      <div className="text-gray-600">Precisão</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <div className="font-bold text-orange-600">
                        {quiz.completion_time_seconds ? Math.floor(quiz.completion_time_seconds / 60) : 0}min
                      </div>
                      <div className="text-gray-600">Tempo</div>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Última atividade: {lastActivity}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {quiz.can_resume && (
                <Button
                  onClick={() => onResumeQuiz(quiz.session_id)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {quiz.status === 'completed' ? 'Refazer Quiz' : 'Continuar Quiz'}
                </Button>
              )}
              
              {onViewQuiz && quiz.status === 'completed' && (
                <Button
                  onClick={() => onViewQuiz(quiz.session_id)}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
              )}
              
              <Button
                onClick={handleGenerateMindMap}
                disabled={isGeneratingMindMap}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white disabled:opacity-70"
              >
                {isGeneratingMindMap ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Mapa Mental
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => onDelete(quiz.session_id)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedQuizHistoryItem;
