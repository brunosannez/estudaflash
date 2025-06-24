
import { useEffect } from "react";
import { useUnifiedProgress } from "@/hooks/useUnifiedProgress";
import { useUserProfile } from "@/hooks/useUserProfile";
import AuthGuard from "@/components/AuthGuard";
import { Loader2, Sparkles, Star, Trophy } from "lucide-react";
import ProgressHeader from "@/components/progress/ProgressHeader";
import ProgressStatsCards from "@/components/progress/ProgressStatsCards";
import ProgressLevelCard from "@/components/progress/ProgressLevelCard";
import ProgressActionsCard from "@/components/progress/ProgressActionsCard";
import ProgressStreakCard from "@/components/progress/ProgressStreakCard";
import ProgressActivitiesCard from "@/components/progress/ProgressActivitiesCard";
import PageLayout from "@/components/navigation/PageLayout";

const MyProgress = () => {
  const { loading, getStats, refreshProgress } = useUnifiedProgress();
  const { getDisplayName } = useUserProfile();

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const stats = getStats();

  if (loading || !stats) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md mx-auto">
            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-4" />
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent mb-2">
              🚀 Carregando sua jornada...
            </div>
            <p className="text-gray-600 text-lg">Preparando suas conquistas incríveis!</p>
          </div>
        </div>
      </PageLayout>
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
    <AuthGuard>
      <PageLayout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-cyan-500 animate-pulse" />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent">
                    Olá, {getDisplayName()}!
                  </h1>
                  <p className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600 font-semibold">
                    Nível {stats.currentLevel} - {getLevelTitle(stats.currentLevel)}
                  </p>
                </div>
                <div className="text-3xl sm:text-5xl animate-bounce">🎪</div>
              </div>
              <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-purple-500 animate-pulse" />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 max-w-2xl mx-auto">
              <p className="text-gray-700 text-sm sm:text-lg font-medium">
                🎯 Continue sua jornada de aprendizado e desbloqueie novas conquistas incríveis! ✨
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <ProgressStatsCards stats={stats} getStreakEmoji={getStreakEmoji} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProgressLevelCard stats={stats} />
            </div>
            <div className="lg:col-span-1">
              <ProgressActionsCard />
            </div>
            <div className="lg:col-span-1">
              <ProgressStreakCard stats={stats} getStreakEmoji={getStreakEmoji} />
            </div>
          </div>

          {/* Activities Section */}
          <div className="grid grid-cols-1 gap-6">
            <ProgressActivitiesCard stats={stats} />
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
};

export default MyProgress;
