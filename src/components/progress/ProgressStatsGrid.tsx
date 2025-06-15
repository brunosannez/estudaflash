
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
        gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
      />
      <StatsCard
        title="Streak Atual"
        value={stats.currentStreak > 0 ? `${stats.currentStreak} dias` : 'Inicie hoje!'}
        icon={Flame}
        gradient="bg-gradient-to-br from-red-500 to-pink-600"
      />
      <StatsCard
        title="Flashcards Hoje"
        value={stats.todayFlashcards.toString()}
        icon={Target}
        gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
      />
      <StatsCard
        title="XP Hoje"
        value={`${stats.todayXp} XP`}
        icon={TrendingUp}
        gradient="bg-gradient-to-br from-green-500 to-teal-600"
      />
    </div>
  );
};

export default ProgressStatsGrid;
