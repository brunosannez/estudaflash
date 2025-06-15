
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProgress, DailyActivity } from '@/types/gamification';
import { calculateRealStreak } from '@/utils/streakCalculator';
import { calculateTodayStats, calculateTotalXP, calculateLevel } from '@/utils/xpCalculator';
import { fetchHistoricalData, upsertUserProgress, upsertDailyActivity } from '@/utils/progressDataHandler';

export const useProgressSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncUserProgressFromHistory = async (): Promise<{ progress: UserProgress | null; activity: DailyActivity | null }> => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { progress: null, activity: null };

      console.log('🔄 Starting complete progress sync for user:', user.id);

      // 1. Buscar todas as atividades históricas
      const { flashcardReviews, quizSessions, quizAnswers } = await fetchHistoricalData(user.id);

      // 2. Calcular XP total baseado em atividades reais
      const { totalXP, totalFlashcards, totalQuizzes, totalCorrectAnswers } = calculateTotalXP(
        flashcardReviews, 
        quizAnswers, 
        quizSessions
      );

      // 3. Calcular nível baseado no XP total
      const currentLevel = calculateLevel(totalXP);

      // 4. Calcular streak real baseado em atividades
      const streak = await calculateRealStreak(user.id);

      // 5. Buscar progresso existente para preservar longest_streak
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // 6. Upsert progresso do usuário
      const progressData = {
        total_xp: totalXP,
        current_level: currentLevel,
        current_streak: streak.current,
        longest_streak: Math.max(streak.longest, existingProgress?.longest_streak || 0),
        last_activity_date: streak.lastActivity,
      };

      const updatedProgress = await upsertUserProgress(user.id, progressData);

      // 7. Atualizar atividade de hoje
      const todayStats = await calculateTodayStats(user.id);
      const activityData = {
        flashcards_reviewed: todayStats.flashcards,
        quizzes_completed: todayStats.quizzes,
        quiz_correct_answers: todayStats.correctAnswers,
        xp_earned: todayStats.xp,
      };

      const updatedActivity = await upsertDailyActivity(user.id, activityData);

      console.log('✅ Progress sync completed:', {
        totalXP,
        currentLevel,
        streak: streak.current,
        todayStats
      });

      toast({
        title: "✅ Progresso Sincronizado!",
        description: `XP total: ${totalXP} | Nível: ${currentLevel} | Streak: ${streak.current} dias`,
        duration: 5000,
      });

      return { progress: updatedProgress, activity: updatedActivity };

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "Erro na Sincronização",
        description: "Não foi possível sincronizar o progresso. Tente novamente.",
        variant: "destructive",
      });
      return { progress: null, activity: null };
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncUserProgressFromHistory,
    syncing
  };
};
