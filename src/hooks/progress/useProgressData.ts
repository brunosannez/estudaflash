
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProgress, DailyActivity } from '@/types/gamification';
import { useProgressCalculations } from './useProgressCalculations';

export interface ProgressDataState {
  progress: UserProgress | null;
  todayActivity: DailyActivity | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const useProgressData = () => {
  const [data, setData] = useState<ProgressDataState>({
    progress: null,
    todayActivity: null,
    loading: true,
    error: null,
    isInitialized: false
  });

  const { calculateXP, calculateLevel } = useProgressCalculations();

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

  return {
    data,
    setData,
    fetchProgressData
  };
};
