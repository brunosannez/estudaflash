
import { supabase } from '@/integrations/supabase/client';
import { UserProgress, DailyActivity } from '@/types/gamification';
import { calculateRealStreak } from '@/utils/streakCalculator';
import { calculateTodayStats, calculateTotalXP, calculateLevel } from '@/utils/xpCalculator';
import { fetchHistoricalData, upsertUserProgress, upsertDailyActivity } from '@/utils/progressDataHandler';

export class ProgressSyncService {
  static async syncUserProgressFromHistory(userId: string): Promise<{ progress: UserProgress | null; activity: DailyActivity | null }> {
    try {
      console.log('🔄 Starting complete progress sync for user:', userId);

      // 1. Buscar todas as atividades históricas
      const { flashcardReviews, quizSessions, quizAnswers } = await fetchHistoricalData(userId);

      // 2. Calcular XP total baseado em atividades reais
      const { totalXP, totalFlashcards, totalQuizzes, totalCorrectAnswers } = calculateTotalXP(
        flashcardReviews, 
        quizAnswers, 
        quizSessions
      );

      // 3. Calcular nível baseado no XP total
      const currentLevel = calculateLevel(totalXP);

      // 4. Calcular streak real baseado em atividades
      const streak = await calculateRealStreak(userId);

      // 5. Buscar progresso existente para preservar longest_streak
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // 6. Upsert progresso do usuário
      const progressData = {
        total_xp: totalXP,
        current_level: currentLevel,
        current_streak: streak.current,
        longest_streak: Math.max(streak.longest, existingProgress?.longest_streak || 0),
        last_activity_date: streak.lastActivity,
      };

      const updatedProgress = await upsertUserProgress(userId, progressData);

      // 7. Atualizar atividade de hoje
      const todayStats = await calculateTodayStats(userId);
      const activityData = {
        flashcards_reviewed: todayStats.flashcards,
        quizzes_completed: todayStats.quizzes,
        quiz_correct_answers: todayStats.correctAnswers,
        xp_earned: todayStats.xp,
      };

      const updatedActivity = await upsertDailyActivity(userId, activityData);

      console.log('✅ Progress sync completed:', {
        totalXP,
        currentLevel,
        streak: streak.current,
        todayStats
      });

      return { progress: updatedProgress, activity: updatedActivity };

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }
}
