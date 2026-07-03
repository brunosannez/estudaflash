
import { Card, CardContent } from "@/components/ui/card";

interface QuizHistoryStatsProps {
  stats: {
    totalQuizzes: number;
    totalAcertos: number;
    totalPerguntas: number;
    mediaAcertos: number;
  };
}

const QuizHistoryStats = ({ stats }: QuizHistoryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-muted/50 border-2 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-primary">{stats.totalQuizzes}</div>
          <div className="text-sm font-semibold text-primary">Quizzes Feitos</div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-2 border-accent/20">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-accent/80">{stats.totalAcertos}</div>
          <div className="text-sm font-semibold text-accent/70">Respostas Certas</div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-2 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">❓</div>
          <div className="text-2xl font-bold text-primary">{stats.totalPerguntas}</div>
          <div className="text-sm font-semibold text-primary">Total de Perguntas</div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-2 border-brand-orange/20">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-brand-orange/80">{stats.mediaAcertos}%</div>
          <div className="text-sm font-semibold text-brand-orange/70">Média de Acertos</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistoryStats;
