
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Clock } from 'lucide-react';

interface QuizHistoryViewSummaryProps {
  quizTitle: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  completionTime: number;
  createdAt: string;
  resumoTitulo: string;
}

const QuizHistoryViewSummary = ({
  quizTitle,
  correctAnswers,
  totalQuestions,
  percentage,
  completionTime,
  createdAt,
  resumoTitulo
}: QuizHistoryViewSummaryProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-purple-600" />
          {quizTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-700">{correctAnswers}/{totalQuestions}</div>
            <div className="text-sm text-blue-600">Acertos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Trophy className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-700">{percentage}%</div>
            <div className="text-sm text-green-600">Aproveitamento</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-700">{formatTime(completionTime)}</div>
            <div className="text-sm text-purple-600">Tempo</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-700">
              {new Date(createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="text-sm text-gray-600">Data</div>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          <strong>Arquivo:</strong> {resumoTitulo}
        </p>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryViewSummary;
