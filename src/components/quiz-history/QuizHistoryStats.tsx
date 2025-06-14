
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
      <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-blue-700">{stats.totalQuizzes}</div>
          <div className="text-sm font-semibold text-blue-600">Quizzes Feitos</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-700">{stats.totalAcertos}</div>
          <div className="text-sm font-semibold text-green-600">Respostas Certas</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">❓</div>
          <div className="text-2xl font-bold text-purple-700">{stats.totalPerguntas}</div>
          <div className="text-sm font-semibold text-purple-600">Total de Perguntas</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-200">
        <CardContent className="p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-orange-700">{stats.mediaAcertos}%</div>
          <div className="text-sm font-semibold text-orange-600">Média de Acertos</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizHistoryStats;
