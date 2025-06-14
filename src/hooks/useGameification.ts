
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProgress, DailyActivity, ActivityType, GameStats } from "@/types/gamification";
import { GamificationService } from "@/services/gamificationService";
import { getXpForNextLevel, calculateXpProgress } from "@/utils/gamificationUtils";

export const useGameification = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar progresso do usuário
  const fetchUserProgress = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const progressData = await GamificationService.fetchOrCreateUserProgress(user.id);
      const activityData = await GamificationService.fetchOrCreateDailyActivity(user.id);
      
      setProgress(progressData);
      setTodayActivity(activityData);
    } catch (error) {
      console.error("Erro ao buscar dados de gamificação:", error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar XP e atualizar progresso
  const addXP = async (xpAmount: number, activityType: ActivityType) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !progress || !todayActivity) return;

    try {
      const updatedProgress = await GamificationService.updateUserProgress(
        user.id,
        progress,
        xpAmount
      );

      const updatedActivity = await GamificationService.updateDailyActivity(
        user.id,
        todayActivity,
        xpAmount,
        activityType
      );

      if (updatedProgress) setProgress(updatedProgress);
      if (updatedActivity) setTodayActivity(updatedActivity);

      // Mostrar notificação se subiu de nível
      if (updatedProgress && updatedProgress.current_level > progress.current_level) {
        toast({
          title: "🎉 Nível Aumentado!",
          description: `Parabéns! Você chegou ao nível ${updatedProgress.current_level}!`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar XP:", error);
    }
  };

  // Buscar estatísticas gerais
  const getStats = (): GameStats | null => {
    if (!progress || !todayActivity) return null;

    const currentXp = progress.total_xp;
    const nextLevelXp = getXpForNextLevel(progress.current_level);
    const currentLevelMinXp = progress.current_level === 1 ? 0 : 
      progress.current_level === 2 ? 50 : 
      progress.current_level === 3 ? 150 : 
      300 + (progress.current_level - 4) * 200;

    return {
      currentLevel: progress.current_level,
      currentXp,
      nextLevelXp,
      currentLevelMinXp,
      xpProgress: calculateXpProgress(currentXp, progress.current_level),
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      todayFlashcards: todayActivity.flashcards_reviewed,
      todayQuizzes: todayActivity.quizzes_completed,
      todayCorrectAnswers: todayActivity.quiz_correct_answers,
      todayXp: todayActivity.xp_earned
    };
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  return {
    progress,
    todayActivity,
    loading,
    addXP,
    fetchUserProgress,
    getStats
  };
};

export * from "@/types/gamification";
