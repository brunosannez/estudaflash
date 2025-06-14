
import { useEffect } from "react";
import { useGameification } from "@/hooks/useGameification";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Target, Clock, Star, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

const MyProgress = () => {
  const { loading, getStats, fetchUserProgress } = useGameification();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const stats = getStats();

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎯 Meu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Progresso</span>
            </h1>
            <p className="text-xl text-gray-600">
              Acompanhe sua jornada de aprendizado e conquiste novos níveis!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Nível Atual</p>
                      <p className="text-3xl font-bold mt-1">{stats.currentLevel}</p>
                    </div>
                    <Trophy className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Streak</p>
                      <p className="text-3xl font-bold mt-1">{stats.currentStreak} 🔥</p>
                    </div>
                    <Flame className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">XP Total</p>
                      <p className="text-3xl font-bold mt-1">{stats.currentXp}</p>
                    </div>
                    <Star className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">XP Hoje</p>
                      <p className="text-3xl font-bold mt-1">{stats.todayXp}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                  Streak de Estudos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold">{stats.currentStreak} dias 🔥</span>
                  <span className="text-sm text-gray-500">Recorde: {stats.longestStreak} dias</span>
                </div>
                <div className="flex space-x-1 overflow-x-auto">
                  {Array.from({length: Math.min(stats.currentStreak, 10)}).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    >
                      ✓
                    </div>
                  ))}
                  {stats.currentStreak < 10 && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                      ?
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Atividades de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Flashcards Revisados</span>
                  <span className="text-lg font-bold text-blue-600">{stats.todayFlashcards}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Quizzes Completados</span>
                  <span className="text-lg font-bold text-green-600">{stats.todayQuizzes}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Respostas Corretas</span>
                  <span className="text-lg font-bold text-purple-600">{stats.todayCorrectAnswers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Sistema de XP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Flashcard Revisado</span>
                    <span className="text-sm font-bold text-green-600">+5 XP</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Quiz Correto</span>
                    <span className="text-sm font-bold text-green-600">+10 XP</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Quiz Incorreto</span>
                    <span className="text-sm font-bold text-green-600">+2 XP</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-center">
                  <p className="text-sm opacity-90">💡 Dica</p>
                  <p className="text-xs mt-1">Continue estudando para manter seu streak!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MyProgress;
