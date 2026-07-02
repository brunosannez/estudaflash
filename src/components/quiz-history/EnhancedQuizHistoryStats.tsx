
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, PlayCircle, CheckCircle } from "lucide-react";

interface EnhancedQuizHistoryStatsProps {
  stats: {
    totalQuizzes: number;
    completedQuizzes: number;
    inProgressQuizzes: number;
    totalAcertos: number;
    totalPerguntas: number;
    mediaAcertos: number;
  };
}

const EnhancedQuizHistoryStats = ({ stats }: EnhancedQuizHistoryStatsProps) => {
  const completionRate = stats.totalQuizzes > 0 
    ? Math.round((stats.completedQuizzes / stats.totalQuizzes) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-muted/50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            Total de Quizzes
          </CardTitle>
          <Trophy className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats.totalQuizzes}</div>
          <p className="text-xs text-primary">
            {stats.completedQuizzes} concluídos, {stats.inProgressQuizzes} em andamento
          </p>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            Taxa de Conclusão
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{completionRate}%</div>
          <Progress value={completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">
            Precisão Geral
          </CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.mediaAcertos}%</div>
          <p className="text-xs text-primary">
            {stats.totalAcertos} de {stats.totalPerguntas} questões
          </p>
        </CardContent>
      </Card>

      <Card className="bg-muted/50 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">
            Em Progresso
          </CardTitle>
          <PlayCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{stats.inProgressQuizzes}</div>
          <p className="text-xs text-orange-600">
            {stats.inProgressQuizzes > 0 ? 'Continue seus estudos!' : 'Todos os quizzes concluídos!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedQuizHistoryStats;
