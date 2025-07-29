
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProgressCalculations } from './useProgressCalculations';

export const useProgressUpdater = () => {
  const { calculateXP, calculateLevel } = useProgressCalculations();

  const updateProgressAfterActivity = useCallback(async (
    activityType: 'flashcard' | 'quiz_correct' | 'quiz_incorrect',
    customXp?: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Updating progress after activity:', activityType);

      // Fetch current progress
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];

      // Fetch or create today's activity
      let { data: todayActivity } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .single();

      if (!todayActivity) {
        const { data: newActivity } = await supabase
          .from('daily_activities')
          .insert({
            user_id: user.id,
            activity_date: today,
            flashcards_reviewed: 0,
            quizzes_completed: 0,
            quiz_correct_answers: 0,
            xp_earned: 0
          })
          .select()
          .single();
        todayActivity = newActivity;
      }

      if (!todayActivity) return;

      // Calculate XP for this activity
      let xpGained = 0;
      let updatedActivity = { ...todayActivity };

      switch (activityType) {
        case 'flashcard':
          xpGained = customXp || 10; // Usar XP customizado ou padrão 10
          updatedActivity.flashcards_reviewed += 1;
          break;
        case 'quiz_correct':
          xpGained = customXp || 10;
          updatedActivity.quizzes_completed += 1;
          updatedActivity.quiz_correct_answers += 1;
          break;
        case 'quiz_incorrect':
          xpGained = customXp || 2;
          updatedActivity.quizzes_completed += 1;
          break;
      }

      updatedActivity.xp_earned += xpGained;

      // Update daily activity
      await supabase
        .from('daily_activities')
        .update({
          flashcards_reviewed: updatedActivity.flashcards_reviewed,
          quizzes_completed: updatedActivity.quizzes_completed,
          quiz_correct_answers: updatedActivity.quiz_correct_answers,
          xp_earned: updatedActivity.xp_earned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('activity_date', today);

      // Update user progress
      const newTotalXp = (currentProgress?.total_xp || 0) + xpGained;
      const newLevel = calculateLevel(newTotalXp);
      
      // Update streak if this is first activity today
      let newStreak = currentProgress?.current_streak || 0;
      const lastActivityDate = currentProgress?.last_activity_date;
      
      if (lastActivityDate !== today) {
        const lastDate = lastActivityDate ? new Date(lastActivityDate) : null;
        const todayDate = new Date(today);
        
        if (lastDate) {
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak = (currentProgress?.current_streak || 0) + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          total_xp: newTotalXp,
          current_level: newLevel,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentProgress?.longest_streak || 0),
          last_activity_date: today,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      console.log('✅ Progress updated successfully:', {
        activityType,
        xpGained,
        newTotalXp,
        newLevel,
        newStreak
      });

    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  }, [calculateXP, calculateLevel]);

  return {
    updateProgressAfterActivity
  };
};
