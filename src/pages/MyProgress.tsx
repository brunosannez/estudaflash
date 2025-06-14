
import { useEffect } from "react";
import { useGameification } from "@/hooks/useGameification";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Loader2 } from "lucide-react";
import ProgressHeader from "@/components/progress/ProgressHeader";
import ProgressStatsCards from "@/components/progress/ProgressStatsCards";
import ProgressLevelCard from "@/components/progress/ProgressLevelCard";
import ProgressActionsCard from "@/components/progress/ProgressActionsCard";
import ProgressStreakCard from "@/components/progress/ProgressStreakCard";
import ProgressActivitiesCard from "@/components/progress/ProgressActivitiesCard";

const MyProgress = () => {
  const { loading, getStats, fetchUserProgress } = useGameification();

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
          <ProgressHeader level={stats.currentLevel} getLevelTitle={getLevelTitle} />
          
          <ProgressStatsCards stats={stats} getStreakEmoji={getStreakEmoji} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ProgressLevelCard stats={stats} />
            <ProgressActionsCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressStreakCard stats={stats} getStreakEmoji={getStreakEmoji} />
            <ProgressActivitiesCard stats={stats} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MyProgress;
