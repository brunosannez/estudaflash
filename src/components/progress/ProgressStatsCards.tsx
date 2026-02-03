
import { Card, CardContent } from '@/components/ui/card';
import { Star, Flame, TrendingUp, Award } from 'lucide-react';
import { GameStats } from '@/types/gamification';

interface ProgressStatsCardsProps {
  stats: GameStats;
  getStreakEmoji: (streak: number) => string;
}

const ProgressStatsCards = ({ stats, getStreakEmoji }: ProgressStatsCardsProps) => {
  const accuracy = stats.todayQuizzes > 0
    ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">XP total</p>
            <p className="text-2xl font-semibold">{stats.currentXp}</p>
          </div>
          <Star className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Sequência</p>
            <p className="text-2xl font-semibold">
              {stats.currentStreak} <span className="text-base">{getStreakEmoji(stats.currentStreak)}</span>
            </p>
          </div>
          <Flame className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">XP hoje</p>
            <p className="text-2xl font-semibold">{stats.todayXp}</p>
          </div>
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Acerto (hoje)</p>
            <p className="text-2xl font-semibold">{accuracy}%</p>
          </div>
          <Award className="h-6 w-6 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressStatsCards;
