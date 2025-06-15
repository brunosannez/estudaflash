import { supabase } from "@/integrations/supabase/client";
import { UserProgress, DailyActivity, ActivityType } from "@/types/gamification";
import { calculateLevel } from "@/utils/gamificationUtils";

export class GamificationService {
  // Buscar ou criar progresso do usuário com retry e verificação de dados históricos
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
        console.log('📝 Creating new user progress with historical data verification');
        
        // Verificar se há dados históricos para calcular progresso inicial correto
        const historicalData = await this.calculateHistoricalProgress(userId);
        
        const { data: newProgress, error: createError } = await supabase
          .from("user_progress")
          .insert({
            user_id: userId,
            total_xp: historicalData.totalXp,
            current_level: historicalData.level,
            current_streak: historicalData.streak.current,
            longest_streak: historicalData.streak.longest,
            last_activity_date: historicalData.streak.lastActivity
          })
          .select()
          .single();
          
        if (createError) {
          console.error("❌ Error creating progress:", createError);
          throw createError;
        }
        
        console.log('✅ New progress created with historical data:', newProgress);
        return newProgress;
      }

      // Verificar se o progresso existente está atualizado
      const historicalData = await this.calculateHistoricalProgress(userId);
      
      // Se há uma discrepância significativa, atualizar
      if (Math.abs(progressData.total_xp - historicalData.totalXp) > 10) {
        console.log('🔄 Progress data inconsistent, updating...');
        
        const { data: updatedProgress, error: updateError } = await supabase
          .from("user_progress")
          .update({
            total_xp: historicalData.totalXp,
            current_level: historicalData.level,
            current_streak: historicalData.streak.current,
            longest_streak: Math.max(historicalData.streak.longest, progressData.longest_streak),
            last_activity_date: historicalData.streak.lastActivity,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();
          
        if (updateError) {
          console.error("❌ Error updating progress:", updateError);
          return progressData; // Retorna dados existentes em caso de erro
        }
        
        console.log('✅ Progress updated with historical data:', updatedProgress);
        return updatedProgress;
      }

      console.log('✅ Progress found and consistent:', progressData);
      return progressData;
    } catch (error) {
      console.error("❌ Critical error in fetchOrCreateUserProgress:", error);
      throw error;
    }
  }

  // Calcular progresso baseado em dados históricos
  static async calculateHistoricalProgress(userId: string) {
    try {
      console.log('📊 Calculating historical progress for:', userId);
      
      // Buscar todas as atividades históricas
      const [flashcardReviews, quizAnswers, quizSessions] = await Promise.all([
        supabase.from('flashcard_reviews').select('*').eq('user_id', userId),
        supabase.from('quiz_respostas').select('*').eq('user_id', userId),
        supabase.from('quiz_sessions').select('*').eq('user_id', userId)
      ]);

      let totalXp = 0;
      
      // XP dos flashcards (5 XP cada)
      const flashcardCount = flashcardReviews.data?.length || 0;
      totalXp += flashcardCount * 5;
      
      // XP dos quizzes
      const quizCount = quizAnswers.data?.length || 0;
      const correctAnswers = quizAnswers.data?.filter(a => a.acertou).length || 0;
      totalXp += correctAnswers * 10; // 10 XP por resposta correta
      totalXp += (quizCount - correctAnswers) * 2; // 2 XP por tentativa
      
      // XP de bônus das sessões completas
      if (quizSessions.data) {
        quizSessions.data.forEach(session => {
          const accuracy = (session.correct_answers / session.total_questions) * 100;
          if (accuracy === 100) totalXp += 50;
          else if (accuracy >= 80) totalXp += 25;
          else if (accuracy >= 60) totalXp += 10;
        });
      }
      
      // Calcular nível
      const level = calculateLevel(totalXp);
      
      // Calcular streak baseado em atividades reais
      const streak = await this.calculateRealStreak(userId);
      
      console.log('📊 Historical progress calculated:', {
        totalXp,
        level,
        flashcardCount,
        quizCount,
        correctAnswers,
        streak
      });
      
      return {
        totalXp,
        level,
        streak
      };
    } catch (error) {
      console.error('❌ Error calculating historical progress:', error);
      return {
        totalXp: 0,
        level: 1,
        streak: { current: 0, longest: 0, lastActivity: null }
      };
    }
  }

  // Calcular streak real baseado em atividades
  static async calculateRealStreak(userId: string) {
    try {
      // Buscar todas as datas com atividades
      const [flashcardDates, quizDates] = await Promise.all([
        supabase
          .from('flashcard_reviews')
          .select('data_review')
          .eq('user_id', userId),
        supabase
          .from('quiz_respostas')
          .select('data_resposta')
          .eq('user_id', userId)
      ]);

      const activityDates = new Set<string>();
      
      flashcardDates.data?.forEach(review => {
        activityDates.add(review.data_review.split('T')[0]);
      });
      
      quizDates.data?.forEach(answer => {
        activityDates.add(answer.data_resposta.split('T')[0]);
      });

      const sortedDates = Array.from(activityDates).sort().reverse();
      
      if (sortedDates.length === 0) {
        return { current: 0, longest: 0, lastActivity: null };
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calcular streak atual (dias consecutivos até hoje)
      for (let i = 0; i < sortedDates.length; i++) {
        const date = sortedDates[i];
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (date === expectedDateStr) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calcular maior streak histórico
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const currentDate = new Date(sortedDates[i]);
          const prevDate = new Date(sortedDates[i - 1]);
          const diffDays = Math.abs((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        current: currentStreak,
        longest: longestStreak,
        lastActivity: sortedDates[0] || null
      };
    } catch (error) {
      console.error('❌ Erro ao calcular streak real:', error);
      return { current: 0, longest: 0, lastActivity: null };
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
