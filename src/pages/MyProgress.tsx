
import { useEffect } from "react";
import { useGameification } from "@/hooks/useGameification";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Loader2, Sparkles, Star, Trophy } from "lucide-react";
import ProgressHeader from "@/components/progress/ProgressHeader";
import ProgressStatsCards from "@/components/progress/ProgressStatsCards";
import ProgressLevelCard from "@/components/progress/ProgressLevelCard";
import ProgressActionsCard from "@/components/progress/ProgressActionsCard";
import ProgressStreakCard from "@/components/progress/ProgressStreakCard";
import ProgressActivitiesCard from "@/components/progress/ProgressActivitiesCard";
import { designColors } from '@/utils/designSystem';

const MyProgress = () => {
  const { loading, getStats, fetchUserProgress } = useGameification();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const stats = getStats();

  if (loading || !stats) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${designColors.gradients.primary}`}>
        <div className={`${designColors.cards.primary} p-8 text-center`}>
          <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-4" />
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🚀 Carregando sua jornada...
          </div>
          <p className="text-gray-600 text-lg">Preparando suas conquistas incríveis!</p>
        </div>
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
    <AuthGuard>
      <div className={`min-h-screen bg-gradient-to-br ${designColors.gradients.primary} relative overflow-hidden`}>
        {/* Elementos decorativos flutuantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-bounce opacity-20">🏆</div>
          <div className="absolute top-60 right-20 text-4xl animate-pulse opacity-30">⭐</div>
          <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-20">🌟</div>
          <div className="absolute bottom-60 right-10 text-3xl animate-bounce opacity-25">✨</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl animate-pulse opacity-10">🎯</div>
        </div>

        <Header />
        <div className="container mx-auto py-8 px-4 relative z-10">
          <ProgressHeader level={stats.currentLevel} getLevelTitle={getLevelTitle} />
          
          <div className={designColors.animations.slideIn}>
            <ProgressStatsCards stats={stats} getStreakEmoji={getStreakEmoji} />
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 ${designColors.animations.slideIn}`}>
            <div className={designColors.animations.cardHover}>
              <ProgressLevelCard stats={stats} />
            </div>
            <div className={designColors.animations.cardHover}>
              <ProgressActionsCard />
            </div>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${designColors.animations.slideIn}`}>
            <div className={designColors.animations.cardHover}>
              <ProgressStreakCard stats={stats} getStreakEmoji={getStreakEmoji} />
            </div>
            <div className={designColors.animations.cardHover}>
              <ProgressActivitiesCard stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MyProgress;
