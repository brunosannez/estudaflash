
import { supabase } from "@/integrations/supabase/client";
import { UserProgress, DailyActivity, ActivityType } from "@/types/gamification";
import { calculateLevel, calculateStreak } from "@/utils/gamificationUtils";

export class GamificationService {
  // Buscar ou criar progresso do usuário
  static async fetchOrCreateUserProgress(userId: string): Promise<UserProgress | null> {
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      console.error("Erro ao buscar progresso:", progressError);
      return null;
    }

    if (!progressData) {
      const { data: newProgress } = await supabase
        .from("user_progress")
        .insert({
          user_id: userId,
          total_xp: 0,
          current_level: 1,
          current_streak: 0,
          longest_streak: 0
        })
        .select()
        .single();
      return newProgress;
    }

    return progressData;
  }

  // Buscar ou criar atividade diária
  static async fetchOrCreateDailyActivity(userId: string): Promise<DailyActivity | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: activityData } = await supabase
      .from("daily_activities")
      .select("*")
      .eq("user_id", userId)
      .eq("activity_date", today)
      .single();

    if (!activityData) {
      const { data: newActivity } = await supabase
        .from("daily_activities")
        .insert({
          user_id: userId,
          activity_date: today,
          flashcards_reviewed: 0,
          quizzes_completed: 0,
          quiz_correct_answers: 0,
          xp_earned: 0
        })
        .select()
        .single();
      return newActivity;
    }

    return activityData;
  }

  // Atualizar progresso do usuário
  static async updateUserProgress(
    userId: string,
    progress: UserProgress,
    xpAmount: number
  ): Promise<UserProgress | null> {
    const newTotalXp = progress.total_xp + xpAmount;
    const newLevel = calculateLevel(newTotalXp);
    const today = new Date().toISOString().split('T')[0];

    let newStreak = progress.current_streak;
    if (progress.last_activity_date !== today) {
      const lastDate = progress.last_activity_date ? new Date(progress.last_activity_date) : null;
      const todayDate = new Date(today);
      
      if (lastDate) {
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = progress.current_streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    const { data: updatedProgress } = await supabase
      .from("user_progress")
      .update({
        total_xp: newTotalXp,
        current_level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress.longest_streak),
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .select()
      .single();

    return updatedProgress;
  }

  // Atualizar atividade diária
  static async updateDailyActivity(
    userId: string,
    activity: DailyActivity,
    xpAmount: number,
    activityType: ActivityType
  ): Promise<DailyActivity | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const updates: any = {
      xp_earned: activity.xp_earned + xpAmount,
      updated_at: new Date().toISOString()
    };

    if (activityType === 'flashcard') {
      updates.flashcards_reviewed = activity.flashcards_reviewed + 1;
    } else if (activityType === 'quiz_correct') {
      updates.quizzes_completed = activity.quizzes_completed + 1;
      updates.quiz_correct_answers = activity.quiz_correct_answers + 1;
    } else if (activityType === 'quiz_incorrect') {
      updates.quizzes_completed = activity.quizzes_completed + 1;
    }

    const { data: updatedActivity } = await supabase
      .from("daily_activities")
      .update(updates)
      .eq("user_id", userId)
      .eq("activity_date", today)
      .select()
      .single();

    return updatedActivity;
  }
}
