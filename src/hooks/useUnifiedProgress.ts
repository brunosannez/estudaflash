
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProgress, DailyActivity, GameStats } from '@/types/gamification';

interface UnifiedProgressData {
  progress: UserProgress | null;
  todayActivity: DailyActivity | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const useUnifiedProgress = () => {
  const [data, setData] = useState<UnifiedProgressData>({
    progress: null,
    todayActivity: null,
    loading: true,
    error: null,
    isInitialized: false
  });

  const calculateXP = useCallback((flashcardCount: number, correctAnswers: number, incorrectAnswers: number) => {
    return (flashcardCount * 5) + (correctAnswers * 10) + (incorrectAnswers * 2);
  }, []);

  const calculateLevel = useCallback((totalXp: number) => {
    if (totalXp < 50) return 1;
    if (totalXp < 150) return 2;
    if (totalXp < 300) return 3;
    return Math.floor((totalXp - 300) / 200) + 4;
  }, []);

  const fetchProgressData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData(prev => ({ ...prev, loading: false, isInitialized: true }));
        return;
      }

      console.log('🔄 Fetching unified progress data...');

      // Fetch historical activity data with safe queries
      const [flashcardResult, quizResult, sessionResult] = await Promise.allSettled([
        supabase.from('flashcard_reviews').select('*').eq('user_id', user.id),
        supabase.from('quiz_respostas').select('*').eq('user_id', user.id),
        supabase.from('quiz_sessions').select('*').eq('user_id', user.id).eq('status', 'completed')
      ]);

      // Safely extract data
      const flashcardReviews = flashcardResult.status === 'fulfilled' ? flashcardResult.value.data || [] : [];
      const quizAnswers = quizResult.status === 'fulfilled' ? quizResult.value.data || [] : [];
      const completedSessions = sessionResult.status === 'fulfilled' ? sessionResult.value.data || [] : [];

      // Calculate totals
      const totalFlashcards = flashcardReviews.length;
      const correctAnswers = quizAnswers.filter(a => a.acertou).length;
      const incorrectAnswers = quizAnswers.length - correctAnswers;
      const totalXP = calculateXP(totalFlashcards, correctAnswers, incorrectAnswers);
      const currentLevel = calculateLevel(totalXP);

      // Calculate today's activity
      const today = new Date().toISOString().split('T')[0];
      const todayFlashcards = flashcardReviews.filter(r => r.data_review?.startsWith(today)).length;
      const todayQuizAnswers = quizAnswers.filter(a => a.data_resposta?.startsWith(today));
      const todayCorrect = todayQuizAnswers.filter(a => a.acertou).length;
      const todayXP = calculateXP(todayFlashcards, todayCorrect, todayQuizAnswers.length - todayCorrect);

      // Calculate streak (simplified - consecutive days with activity)
      const activityDates = new Set([
        ...flashcardReviews.map(r => r.data_review?.split('T')[0]).filter(Boolean),
        ...quizAnswers.map(a => a.data_resposta?.split('T')[0]).filter(Boolean)
      ]);
      
      const sortedDates = Array.from(activityDates).sort().reverse();
      let currentStreak = 0;
      let longestStreak = 0;
      let streakCount = 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toDateString() === expectedDate.toDateString()) {
          streakCount++;
          if (i === 0) currentStreak = streakCount;
        } else {
          longestStreak = Math.max(longestStreak, streakCount);
          streakCount = 0;
        }
      }
      longestStreak = Math.max(longestStreak, streakCount);

      // Upsert user progress
      const progressData = {
        user_id: user.id,
        total_xp: totalXP,
        current_level: currentLevel,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: sortedDates[0] || null,
        updated_at: new Date().toISOString()
      };

      const { data: progress } = await supabase
        .from('user_progress')
        .upsert(progressData, { onConflict: 'user_id' })
        .select()
        .single();

      // Upsert daily activity
      const activityData = {
        user_id: user.id,
        activity_date: today,
        flashcards_reviewed: todayFlashcards,
        quizzes_completed: todayQuizAnswers.length,
        quiz_correct_answers: todayCorrect,
        xp_earned: todayXP,
        updated_at: new Date().toISOString()
      };

      const { data: activity } = await supabase
        .from('daily_activities')
        .upsert(activityData, { onConflict: 'user_id,activity_date' })
        .select()
        .single();

      setData({
        progress,
        todayActivity: activity,
        loading: false,
        error: null,
        isInitialized: true
      });

      console.log('✅ Unified progress data loaded successfully');

    } catch (error) {
      console.error('❌ Error loading progress data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar dados de progresso',
        isInitialized: true
      }));
    }
  }, [calculateXP, calculateLevel]);

  const getStats = useCallback((): GameStats | null => {
    if (!data.progress || !data.todayActivity) return null;

    const nextLevelXp = data.progress.current_level < 3 ? 
      (data.progress.current_level === 1 ? 50 : 150) : 
      300 + (data.progress.current_level - 3) * 200;

    const currentLevelMinXp = data.progress.current_level === 1 ? 0 :
      data.progress.current_level === 2 ? 50 :
      data.progress.current_level === 3 ? 150 :
      300 + (data.progress.current_level - 4) * 200;

    const xpProgress = Math.min(100, Math.max(0, 
      ((data.progress.total_xp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100
    ));

    return {
      currentLevel: data.progress.current_level,
      currentXp: data.progress.total_xp,
      nextLevelXp,
      currentLevelMinXp,
      xpProgress,
      currentStreak: data.progress.current_streak,
      longestStreak: data.progress.longest_streak,
      todayFlashcards: data.todayActivity.flashcards_reviewed,
      todayQuizzes: data.todayActivity.quizzes_completed,
      todayCorrectAnswers: data.todayActivity.quiz_correct_answers,
      todayXp: data.todayActivity.xp_earned
    };
  }, [data.progress, data.todayActivity]);

  const addXP = useCallback(async (xpAmount: number) => {
    if (!data.progress || !data.todayActivity) return;

    try {
      const newTotalXp = data.progress.total_xp + xpAmount;
      const newLevel = calculateLevel(newTotalXp);
      
      // Update local state immediately
      setData(prev => ({
        ...prev,
        progress: prev.progress ? {
          ...prev.progress,
          total_xp: newTotalXp,
          current_level: newLevel
        } : null,
        todayActivity: prev.todayActivity ? {
          ...prev.todayActivity,
          xp_earned: prev.todayActivity.xp_earned + xpAmount
        } : null
      }));

      // Update database in background
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Promise.all([
          supabase
            .from('user_progress')
            .update({ 
              total_xp: newTotalXp, 
              current_level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id),
          supabase
            .from('daily_activities')
            .update({ 
              xp_earned: data.todayActivity.xp_earned + xpAmount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('activity_date', new Date().toISOString().split('T')[0])
        ]);
      }

    } catch (error) {
      console.error('❌ Error adding XP:', error);
    }
  }, [data.progress, data.todayActivity, calculateLevel]);

  // Initial load
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!data.isInitialized) return;

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`progress-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'flashcard_reviews',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🔄 Flashcard activity detected, refreshing...');
          setTimeout(fetchProgressData, 1000);
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'quiz_respostas',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🔄 Quiz activity detected, refreshing...');
          setTimeout(fetchProgressData, 1000);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscriptions();
  }, [data.isInitialized, fetchProgressData]);

  return {
    ...data,
    getStats,
    addXP,
    refreshProgress: fetchProgressData
  };
};
