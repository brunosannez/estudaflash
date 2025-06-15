
import { supabase } from "@/integrations/supabase/client";
import { DailyActivity, ActivityType } from "@/types/gamification";

export class DailyActivityService {
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
