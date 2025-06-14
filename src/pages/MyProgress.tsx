
import { useEffect } from "react";
import { useGameification } from "@/hooks/useGameification";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Target, Clock, Star, TrendingUp, Award, Zap, Home, Brain, FileText, TestTube } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyProgress = () => {
  const { loading, getStats, fetchUserProgress } = useGameification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const stats = getStats();

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando seu progresso...</p>
        </div>
      </div>
    );
  }

  const getLevelTitle = (level: number) => {
    if (level <= 2) return "Iniciante";
    if (level <= 5) return "Estudante";
    if (level <= 10) return "Dedicado";
    if (level <= 15) return "Experiente";
    return "Mestre";
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "🌟";
    if (streak >= 3) return "✨";
    return "💫";
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Nível {stats.currentLevel}
                </h1>
                <p className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold">
                  {getLevelTitle(stats.currentLevel)}
                </p>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Continue sua jornada de aprendizado e desbloqueie novas conquistas!
            </p>
          </div>

          {/* Cards de estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 text-white relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">XP Total</p>
                      <p className="text-3xl font-bold mt-1 animate-pulse">{stats.currentXp}</p>
                    </div>
                    <Star className="h-8 w-8 opacity-80 animate-spin-slow" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Streak Atual</p>
                      <p className="text-3xl font-bold mt-1">{stats.currentStreak} {getStreakEmoji(stats.currentStreak)}</p>
                    </div>
                    <Flame className="h-8 w-8 opacity-80 animate-bounce" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">XP Hoje</p>
                      <p className="text-3xl font-bold mt-1 animate-pulse">{stats.todayXp}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Precisão</p>
                      <p className="text-3xl font-bold mt-1">
                        {stats.todayQuizzes > 0 ? Math.round((stats.todayCorrectAnswers / stats.todayQuizzes) * 100) : 0}%
                      </p>
                    </div>
                    <Award className="h-8 w-8 opacity-80" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progresso do nível e ações rápidas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Progresso do Nível
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Nível {stats.currentLevel}</span>
                  <span className="text-sm text-gray-500">{stats.currentXp} / {stats.nextLevelXp} XP</span>
                </div>
                <Progress value={stats.xpProgress} className="h-4" />
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Faltam apenas {stats.nextLevelXp - stats.currentXp} XP para o próximo nível!</strong>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>🎯 +5 XP por flashcard</span>
                    <span>🧠 +10 XP por quiz correto</span>
                    <span>📚 +2 XP por tentativa</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
                <Button 
                  onClick={() => navigate('/meus-resumos')}
                  variant="outline" 
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Meus Resumos
                </Button>
                <Button 
                  onClick={() => navigate('/meus-flashcards')}
                  variant="outline" 
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Estudar Flashcards
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Streak e atividades de hoje */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flame className="h-5 w-5 mr-2 text-red-500" />
                  Streak de Estudos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">{stats.currentStreak}</div>
                    <div className="text-sm text-gray-500">Dias Atuais</div>
                  </div>
                  <div className="text-4xl">{getStreakEmoji(stats.currentStreak)}</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600 mb-1">{stats.longestStreak}</div>
                    <div className="text-sm text-gray-500">Recorde</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Últimos 7 dias:</div>
                  <div className="flex space-x-1 justify-center">
                    {Array.from({length: 7}).map((_, i) => {
                      const isActive = i < Math.min(stats.currentStreak, 7);
                      return (
                        <div 
                          key={i} 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse' 
                              : 'bg-gray-200'
                          }`}
                        >
                          {isActive ? '✓' : '?'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Atividades de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Flashcards</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.todayFlashcards}</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TestTube className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Quizzes</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.todayQuizzes}</div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Acertos</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats.todayCorrectAnswers}</div>
                </div>

                {stats.todayXp > 0 && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center">
                    <div className="text-lg font-bold">🎉 {stats.todayXp} XP ganhos hoje!</div>
                    <div className="text-sm opacity-90">Continue assim!</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MyProgress;
