
import { useEffect } from 'react';
import { Flame, Trophy, Target, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import StatsCard from './StatsCard';
import { useGameification } from '@/hooks/useGameification';
import { Loader2 } from 'lucide-react';

const ProgressOverview = () => {
  const { loading, getStats, fetchUserProgress, isInitialized } = useGameification();

  useEffect(() => {
    if (!isInitialized) {
      fetchUserProgress();
    }
  }, [isInitialized]);

  const stats = getStats();

  console.log('🎯 ProgressOverview render:', { loading, isInitialized, stats });

  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-lg font-semibold text-gray-600">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎮</div>
          <p className="text-lg font-semibold text-gray-600">Comece a estudar para ver seu progresso!</p>
          <Button 
            onClick={fetchUserProgress}
            variant="outline"
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="XP Total"
          value={stats.currentXp.toString()}
          icon={Trophy}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatsCard
          title="Streak Atual"
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
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-green-500 to-teal-600"
        />
      </div>

      {/* Cards de detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso do Nível */}
        <Card className="transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Progresso do Nível {stats.currentLevel}
            </CardTitle>
            <Button 
              onClick={fetchUserProgress}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Nível {stats.currentLevel}</span>
              <span className="text-sm text-gray-500">
                {stats.currentXp} / {stats.nextLevelXp} XP
              </span>
            </div>
            <Progress value={stats.xpProgress} className="h-3" />
            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Faltam {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!</strong>
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="bg-blue-100 px-2 py-1 rounded">🧠 +5 XP por flashcard</span>
                <span className="bg-green-100 px-2 py-1 rounded">✅ +10 XP por quiz correto</span>
                <span className="bg-orange-100 px-2 py-1 rounded">🎯 +2 XP por tentativa</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak & Performance */}
        <Card className="transform hover:scale-105 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flame className="h-5 w-5 mr-2 text-red-500" />
              Streak & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.currentStreak}</div>
                <div className="text-xs text-gray-500">Dias Atuais</div>
              </div>
              <div className="text-3xl">
                {stats.currentStreak >= 7 ? '🔥' : stats.currentStreak >= 3 ? '⚡' : '💫'}
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">{stats.longestStreak}</div>
                <div className="text-xs text-gray-500">Recorde</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Quizzes Hoje</span>
                </div>
                <span className="font-bold text-blue-600">{stats.todayQuizzes}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Precisão</span>
                </div>
                <span className="font-bold text-green-600">
                  {stats.todayQuizzes > 0 ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100) : 0}%
                </span>
              </div>
            </div>

            {stats.todayXp > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg text-center">
                <div className="font-bold">🎉 {stats.todayXp} XP ganhos hoje!</div>
                <div className="text-sm opacity-90">Continue assim!</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressOverview;
