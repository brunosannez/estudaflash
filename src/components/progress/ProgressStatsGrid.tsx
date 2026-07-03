
import { Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { GameStats } from '@/types/gamification';

interface ProgressStatsGridProps {
  stats: GameStats;
}

const ProgressStatsGrid = ({ stats }: ProgressStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="XP Total"
        value={stats.currentXp.toString()}
        icon={Trophy}
        gradient="bg-brand-orange"
      />
      <StatsCard
        title="Streak Atual"
        value={stats.currentStreak > 0 ? `${stats.currentStreak} dias` : 'Inicie hoje!'}
        icon={Flame}
        gradient="bg-destructive"
      />
      <StatsCard
        title="Flashcards Hoje"
        value={stats.todayFlashcards.toString()}
        icon={Target}
        gradient="bg-primary"
      />
      <StatsCard
        title="XP Hoje"
        value={`${stats.todayXp} XP`}
        icon={TrendingUp}
        gradient="bg-accent"
      />
    </div>
  );
};

export default ProgressStatsGrid;
