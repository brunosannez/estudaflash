
import { useEffect } from 'react';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { useUserProfile } from "@/hooks/useUserProfile";
import AuthGuard from "@/components/AuthGuard";
import { Loader2 } from 'lucide-react';
import ProgressStatsCards from "@/components/progress/ProgressStatsCards";
import ProgressLevelCard from "@/components/progress/ProgressLevelCard";
import ProgressActionsCard from "@/components/progress/ProgressActionsCard";
import ProgressStreakCard from "@/components/progress/ProgressStreakCard";
import ProgressActivitiesCard from "@/components/progress/ProgressActivitiesCard";
import PageLayout from "@/components/navigation/PageLayout";
import ProgressCoachCard from '@/components/progress/ProgressCoachCard';

const MyProgress = () => {
  const { loading, getStats, refreshProgress, topicFocus } = useUnifiedProgress();
  const { getDisplayName } = useUserProfile();

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const stats = getStats();

  if (loading || !stats) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="rounded-lg border bg-background p-8 text-center max-w-md mx-auto">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <div className="text-xl font-semibold mb-2">Carregando seu progresso…</div>
            <p className="text-muted-foreground text-sm">Só um instante.</p>
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
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Oi, {getDisplayName()}!
            </h1>
            <p className="text-muted-foreground">
              Você está no nível <span className="font-medium text-foreground">{stats.currentLevel}</span> ({getLevelTitle(stats.currentLevel)}).
            </p>
          </header>

          <section className="space-y-4">
            <ProgressStatsCards stats={stats} getStreakEmoji={getStreakEmoji} />
          </section>

          {/* Main Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProgressLevelCard stats={stats} />
            <ProgressCoachCard stats={stats} topicFocus={topicFocus ?? null} />
            <ProgressStreakCard stats={stats} getStreakEmoji={getStreakEmoji} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressActivitiesCard stats={stats} />
            <ProgressActionsCard />
          </section>

        </div>
      </PageLayout>
    </AuthGuard>
  );
};

export default MyProgress;
