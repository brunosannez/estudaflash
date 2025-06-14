
import { useEffect } from 'react';
import { Flame, Trophy, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatsCard from './StatsCard';
import { useGameification } from '@/hooks/useGameification';
import { Loader2 } from 'lucide-react';

const ProgressOverview = () => {
  const { loading, getStats, fetchUserProgress } = useGameification();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const stats = getStats();

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="XP Total"
          value={stats.currentXp.toString()}
          icon={Trophy}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatsCard
          title="Streak"
          value={`${stats.currentStreak} dias`}
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
          icon={Clock}
          gradient="bg-gradient-to-br from-green-500 to-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Progresso do Nível
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Nível {stats.currentLevel}</span>
              <span className="text-sm text-gray-500">{stats.currentXp} / {stats.nextLevelXp} XP</span>
            </div>
            <Progress value={stats.xpProgress} className="h-3" />
            <p className="text-sm text-gray-600">
              Faltam apenas {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-red-500" />
              Histórico de Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold">{stats.currentStreak} dias 🔥</span>
              <span className="text-sm text-gray-500">Recorde: {stats.longestStreak} dias</span>
            </div>
            <div className="flex space-x-1">
              {Array.from({length: Math.min(stats.currentStreak, 7)}).map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  ✓
                </div>
              ))}
              {stats.currentStreak < 7 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs">
                  ?
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressOverview;
