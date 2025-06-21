
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Target, Star, Award, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useRealTimeProgress } from '@/hooks/useRealTimeProgress';

const GamificationCards = () => {
  const { getStats } = useRealTimeProgress();
  const stats = getStats();

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getLevelTitle = (level: number) => {
    if (level <= 2) return "🌱 Iniciante";
    if (level <= 5) return "📚 Estudante";
    if (level <= 10) return "💪 Dedicado";
    if (level <= 15) return "🎯 Experiente";
    return "🏆 Mestre";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "🌟";
    if (streak >= 3) return "✨";
    return "💫";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* XP e Nível */}
      <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm font-medium">Nível Atual</p>
              <p className="text-3xl font-bold">{stats.currentLevel}</p>
              <p className="text-purple-200 text-xs">{getLevelTitle(stats.currentLevel)}</p>
            </div>
            <Trophy className="h-12 w-12 text-yellow-300 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP: {stats.currentXp}</span>
              <span>{stats.nextLevelXp}</span>
            </div>
            <Progress value={stats.xpProgress} className="h-2 bg-purple-400" />
            <p className="text-xs text-purple-200">
              Faltam {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!
            </p>
          </div>
        </CardContent>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300 rounded-full opacity-20"></div>
      </Card>

      {/* Streak */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm font-medium">Sequência</p>
              <p className="text-3xl font-bold">{stats.currentStreak}</p>
              <p className="text-orange-200 text-xs">dias consecutivos</p>
            </div>
            <div className="text-4xl animate-bounce">
              {getStreakEmoji(stats.currentStreak)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-yellow-300" />
            <span className="text-sm">Recorde: {stats.longestStreak} dias</span>
          </div>
        </CardContent>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full opacity-20"></div>
      </Card>

      {/* XP Hoje */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium">XP Hoje</p>
              <p className="text-3xl font-bold">{stats.todayXp}</p>
              <p className="text-emerald-200 text-xs">pontos ganhos</p>
            </div>
            <Zap className="h-12 w-12 text-yellow-300 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{stats.todayFlashcards} cards</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span>{stats.todayQuizzes} quizzes</span>
            </div>
          </div>
        </CardContent>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-300 rounded-full opacity-20"></div>
      </Card>
    </div>
  );
};

export default GamificationCards;
