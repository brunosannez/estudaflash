
import { supabase } from "@/integrations/supabase/client";
import { UserProgress, DailyActivity, ActivityType } from "@/types/gamification";
import { calculateLevel } from "@/utils/gamificationUtils";

export class GamificationService {
  // Buscar ou criar progresso do usuário com retry
  static async fetchOrCreateUserProgress(userId: string): Promise<UserProgress | null> {
    console.log('🔍 Fetching user progress for:', userId);
    
    try {
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (progressError) {
        console.error("❌ Error fetching progress:", progressError);
        throw progressError;
      }

      if (!progressData) {
        console.log('📝 Creating new user progress');
        const { data: newProgress, error: createError } = await supabase
          .from("user_progress")
          .insert({
            user_id: userId,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null
          })
          .select()
          .single();
          
        if (createError) {
          console.error("❌ Error creating progress:", createError);
          throw createError;
        }
        
        console.log('✅ New progress created:', newProgress);
        return newProgress;
      }

      console.log('✅ Progress found:', progressData);
      return progressData;
    } catch (error) {
      console.error("❌ Critical error in fetchOrCreateUserProgress:", error);
      throw error;
    }
  }

  // Buscar ou criar atividade diária
  static async fetchOrCreateDailyActivity(userId: string): Promise<DailyActivity | null> {
    const today = new Date().toISOString().split('T')[0];
    console.log('🔍 Fetching daily activity for:', userId, 'date:', today);
    
    try {
      const { data: activityData, error: fetchError } = await supabase
        .from("daily_activities")
        .select("*")
        .eq("user_id", userId)
        .eq("activity_date", today)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error fetching activity:", fetchError);
        throw fetchError;
      }

      if (!activityData) {
        console.log('📝 Creating new daily activity');
        const { data: newActivity, error: createError } = await supabase
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
          
        if (createError) {
          console.error("❌ Error creating activity:", createError);
          throw createError;
        }
        
        console.log('✅ New activity created:', newActivity);
        return newActivity;
      }

      console.log('✅ Activity found:', activityData);
      return activityData;
    } catch (error) {
      console.error("❌ Critical error in fetchOrCreateDailyActivity:", error);
      throw error;
    }
  }

  // Atualizar progresso do usuário
  static async updateUserProgress(
    userId: string,
    progress: UserProgress,
    xpAmount: number
  ): Promise<UserProgress | null> {
    console.log('📈 Updating user progress:', { userId, xpAmount });
    
    try {
      const newTotalXp = progress.total_xp + xpAmount;
      const newLevel = calculateLevel(newTotalXp);
      const today = new Date().toISOString().split('T')[0];

      // Calcular streak
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

      const updateData = {
        total_xp: newTotalXp,
        current_level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress.longest_streak),
        last_activity_date: today,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Progress update data:', updateData);

      const { data: updatedProgress, error } = await supabase
        .from("user_progress")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating progress:", error);
        throw error;
      }

      console.log('✅ Progress updated successfully:', updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error("❌ Critical error in updateUserProgress:", error);
      throw error;
    }
  }

  // Atualizar atividade diária
  static async updateDailyActivity(
    userId: string,
    activity: DailyActivity,
    xpAmount: number,
    activityType: ActivityType
  ): Promise<DailyActivity | null> {
    console.log('📅 Updating daily activity:', { userId, xpAmount, activityType });
    
    try {
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

      console.log('📊 Activity update data:', updates);

      const { data: updatedActivity, error } = await supabase
        .from("daily_activities")
        .update(updates)
        .eq("user_id", userId)
        .eq("activity_date", today)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating activity:", error);
        throw error;
      }

      console.log('✅ Activity updated successfully:', updatedActivity);
      return updatedActivity;
    } catch (error) {
      console.error("❌ Critical error in updateDailyActivity:", error);
      throw error;
    }
  }
}
