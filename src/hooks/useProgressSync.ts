
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProgress, DailyActivity } from '@/types/gamification';

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
      const [flashcardReviews, quizSessions, quizAnswers] = await Promise.all([
        supabase.from('flashcard_reviews').select('*').eq('user_id', user.id),
        supabase.from('quiz_sessions').select('*').eq('user_id', user.id),
        supabase.from('quiz_respostas').select('*').eq('user_id', user.id)
      ]);

      console.log('📊 Historical data:', {
        flashcards: flashcardReviews.data?.length || 0,
        sessions: quizSessions.data?.length || 0,
        answers: quizAnswers.data?.length || 0
      });

      // 2. Calcular XP total baseado em atividades reais
      let totalXP = 0;
      let totalFlashcards = 0;
      let totalQuizzes = 0;
      let totalCorrectAnswers = 0;

      // XP dos flashcards (5 XP cada)
      if (flashcardReviews.data) {
        totalFlashcards = flashcardReviews.data.length;
        totalXP += totalFlashcards * 5;
      }

      // XP dos quizzes
      if (quizAnswers.data) {
        totalQuizzes = quizAnswers.data.length;
        totalCorrectAnswers = quizAnswers.data.filter(a => a.acertou).length;
        totalXP += totalCorrectAnswers * 10; // 10 XP por resposta correta
        totalXP += (totalQuizzes - totalCorrectAnswers) * 2; // 2 XP por tentativa
      }

      // XP de bônus das sessões completas
      if (quizSessions.data) {
        quizSessions.data.forEach(session => {
          const accuracy = (session.correct_answers / session.total_questions) * 100;
          if (accuracy === 100) totalXP += 50;
          else if (accuracy >= 80) totalXP += 25;
          else if (accuracy >= 60) totalXP += 10;
        });
      }

      // 3. Calcular nível baseado no XP total
      const currentLevel = calculateLevel(totalXP);

      // 4. Calcular streak real baseado em atividades
      const streak = await calculateRealStreak(user.id);

      // 5. Buscar ou criar progresso do usuário
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const today = new Date().toISOString().split('T')[0];
      const progressData = {
        user_id: user.id,
        total_xp: totalXP,
        current_level: currentLevel,
        current_streak: streak.current,
        longest_streak: Math.max(streak.longest, existingProgress?.longest_streak || 0),
        last_activity_date: streak.lastActivity,
        updated_at: new Date().toISOString()
      };

      let updatedProgress;
      if (existingProgress) {
        const { data, error } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        updatedProgress = data;
      } else {
        const { data, error } = await supabase
          .from('user_progress')
          .insert(progressData)
          .select()
          .single();
        if (error) throw error;
        updatedProgress = data;
      }

      // 6. Atualizar atividade de hoje
      const todayStats = await calculateTodayStats(user.id);
      const { data: existingActivity } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .maybeSingle();

      const activityData = {
        user_id: user.id,
        activity_date: today,
        flashcards_reviewed: todayStats.flashcards,
        quizzes_completed: todayStats.quizzes,
        quiz_correct_answers: todayStats.correctAnswers,
        xp_earned: todayStats.xp,
        updated_at: new Date().toISOString()
      };

      let updatedActivity;
      if (existingActivity) {
        const { data, error } = await supabase
          .from('daily_activities')
          .update(activityData)
          .eq('user_id', user.id)
          .eq('activity_date', today)
          .select()
          .single();
        if (error) throw error;
        updatedActivity = data;
      } else {
        const { data, error } = await supabase
          .from('daily_activities')
          .insert(activityData)
          .select()
          .single();
        if (error) throw error;
        updatedActivity = data;
      }

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

  const calculateLevel = (xp: number): number => {
    if (xp < 50) return 1;
    if (xp < 150) return 2;
    if (xp < 300) return 3;
    return Math.floor((xp - 300) / 200) + 4;
  };

  const calculateRealStreak = async (userId: string) => {
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

      const today = new Date().toISOString().split('T')[0];
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calcular streak atual
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
      console.error('❌ Erro ao calcular streak:', error);
      return { current: 0, longest: 0, lastActivity: null };
    }
  };

  const calculateTodayStats = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [todayFlashcards, todayQuizAnswers] = await Promise.all([
        supabase
          .from('flashcard_reviews')
          .select('*')
          .eq('user_id', userId)
          .gte('data_review', today)
          .lt('data_review', `${today}T23:59:59`),
        supabase
          .from('quiz_respostas')
          .select('*')
          .eq('user_id', userId)
          .gte('data_resposta', today)
          .lt('data_resposta', `${today}T23:59:59`)
      ]);

      const flashcards = todayFlashcards.data?.length || 0;
      const quizzes = todayQuizAnswers.data?.length || 0;
      const correctAnswers = todayQuizAnswers.data?.filter(a => a.acertou).length || 0;
      
      const xp = (flashcards * 5) + (correctAnswers * 10) + ((quizzes - correctAnswers) * 2);

      return { flashcards, quizzes, correctAnswers, xp };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas de hoje:', error);
      return { flashcards: 0, quizzes: 0, correctAnswers: 0, xp: 0 };
    }
  };

  return {
    syncUserProgressFromHistory,
    syncing
  };
};
