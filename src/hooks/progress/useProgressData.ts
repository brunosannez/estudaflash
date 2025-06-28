
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
        console.log('🔒 No user found, setting initialized');
        setData(prev => ({ ...prev, loading: false, isInitialized: true }));
        return;
      }

      console.log('🔄 Fetching progress data from Supabase for user:', user.id);

      // Fetch historical activity data with better queries
      const [flashcardResult, quizResult, sessionResult] = await Promise.allSettled([
        supabase.from('flashcard_reviews').select('*').eq('user_id', user.id),
        supabase.from('quiz_respostas').select('*').eq('user_id', user.id),
        supabase.from('quiz_sessions').select('*').eq('user_id', user.id).eq('status', 'completed')
      ]);

      // Safely extract data
      const flashcardReviews = flashcardResult.status === 'fulfilled' ? flashcardResult.value.data || [] : [];
      const quizAnswers = quizResult.status === 'fulfilled' ? quizResult.value.data || [] : [];
      const completedSessions = sessionResult.status === 'fulfilled' ? sessionResult.value.data || [] : [];

      console.log('📊 Real data fetched:', {
        flashcards: flashcardReviews.length,
        quizAnswers: quizAnswers.length,
        sessions: completedSessions.length
      });

      // Calculate totals based on real data
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
      const todayIncorrect = todayQuizAnswers.length - todayCorrect;
      const todayXP = calculateXP(todayFlashcards, todayCorrect, todayIncorrect);

      // Calculate streak based on consecutive days with activity
      const activityDates = new Set([
        ...flashcardReviews.map(r => r.data_review?.split('T')[0]).filter(Boolean),
        ...quizAnswers.map(a => a.data_resposta?.split('T')[0]).filter(Boolean)
      ]);
      
      const sortedDates = Array.from(activityDates).sort().reverse();
      let currentStreak = 0;
      let longestStreak = 0;
      
      // Calculate current streak
      if (sortedDates.length > 0) {
        const currentDate = new Date();
        currentStreak = 1; // At least 1 if there's any activity
        
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currentDateCheck = new Date(sortedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currentDateCheck.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
        
        // Calculate longest streak
        let tempStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currentDateCheck = new Date(sortedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currentDateCheck.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      console.log('🎯 Calculated stats:', {
        totalXP,
        currentLevel,
        currentStreak,
        longestStreak,
        todayXP,
        todayFlashcards,
        todayQuizAnswers: todayQuizAnswers.length
      });

      // Upsert user progress with real calculated data
      const progressData = {
        user_id: user.id,
        total_xp: totalXP,
        current_level: currentLevel,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: sortedDates[0] || null,
        updated_at: new Date().toISOString()
      };

      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .upsert(progressData, { onConflict: 'user_id' })
        .select()
        .single();

      if (progressError) {
        console.error('❌ Error upserting progress:', progressError);
        throw progressError;
      }

      // Upsert daily activity with real data
      const activityData = {
        user_id: user.id,
        activity_date: today,
        flashcards_reviewed: todayFlashcards,
        quizzes_completed: todayQuizAnswers.length,
        quiz_correct_answers: todayCorrect,
        xp_earned: todayXP,
        updated_at: new Date().toISOString()
      };

      const { data: activity, error: activityError } = await supabase
        .from('daily_activities')
        .upsert(activityData, { onConflict: 'user_id,activity_date' })
        .select()
        .single();

      if (activityError) {
        console.error('❌ Error upserting activity:', activityError);
        throw activityError;
      }

      setData({
        progress,
        todayActivity: activity,
        loading: false,
        error: null,
        isInitialized: true
      });

      console.log('✅ Progress data loaded and synced successfully');

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
