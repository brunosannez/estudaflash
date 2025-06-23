
import { Calendar, Target, Trophy, Clock } from "lucide-react";

interface QuizMetricsProps {
  quiz: {
    data_criacao: string;
    acertos: number;
    total_perguntas: number;
    tempo_conclusao: number;
  };
  percentage: number;
}

const QuizMetrics = ({ quiz, percentage }: QuizMetricsProps) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
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
  );
};

export default QuizMetrics;
