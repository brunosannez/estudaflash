
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, Star } from 'lucide-react';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { useUsageData } from '@/hooks/useUsageData';

const StudyStatsGrid = () => {
  const { getStats } = useUnifiedProgress();
  const { usageData } = useUsageData();
  const stats = getStats();

  if (!stats || !usageData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const accuracy = stats.todayQuizzes > 0 
    ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100) 
    : 0;

  const totalActivities = usageData.uploads_realizados + usageData.flashcards_gerados + usageData.quizzes_realizados;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Flashcards Total */}
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{usageData.flashcards_gerados}</p>
              <p className="text-xs text-muted-foreground">Flashcards</p>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {stats.todayFlashcards} hoje
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes e Precisão */}
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/15 rounded-lg">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{usageData.quizzes_realizados}</p>
              <p className="text-xs text-muted-foreground">Quizzes</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={accuracy >= 80 ? "default" : "secondary"} className="text-xs">
              {accuracy}% precisão
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Atividade Total */}
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{totalActivities}</p>
              <p className="text-xs text-muted-foreground">Atividades</p>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Total
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* XP Atual */}
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-brand-orange rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-orange/15 rounded-lg">
              <Star className="h-5 w-5 text-brand-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-orange">{stats.currentXp}</p>
              <p className="text-xs text-muted-foreground">XP Total</p>
            </div>
          </div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Nível {stats.currentLevel}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyStatsGrid;
