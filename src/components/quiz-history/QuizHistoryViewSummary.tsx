
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
          <Trophy className="h-6 w-6 text-primary" />
          {quizTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <Target className="h-6 w-6 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">{correctAnswers}/{totalQuestions}</div>
            <div className="text-sm text-primary">Acertos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Trophy className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-700">{percentage}%</div>
            <div className="text-sm text-green-600">Aproveitamento</div>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-primary">{formatTime(completionTime)}</div>
            <div className="text-sm text-primary">Tempo</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-bold text-foreground/80">
              {new Date(createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="text-sm text-muted-foreground">Data</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Arquivo:</strong> {resumoTitulo}
        </p>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryViewSummary;
