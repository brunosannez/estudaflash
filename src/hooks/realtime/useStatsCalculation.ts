
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StatsData {
  totalSummaries: number;
  totalQuizzes: number;
  totalFlashcards: number;
  recentActivity: any[];
}

export const useStatsCalculation = () => {
  const fetchStats = useCallback(async (): Promise<StatsData> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        totalSummaries: 0,
        totalQuizzes: 0,
        totalFlashcards: 0,
        recentActivity: []
      };
    }

    // Safe parallel queries with error handling
    const [summariesResult, quizSessionsResult, flashcardsResult, recentResult] = await Promise.allSettled([
      supabase.from('resumos').select('id', { count: 'exact' }).eq('upload_id', user.id),
      supabase.from('quiz_sessions').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('flashcard_reviews').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('quiz_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    ]);

    // Extract data safely
    const summariesCount = summariesResult.status === 'fulfilled' ? summariesResult.value.count || 0 : 0;
    const quizSessionsCount = quizSessionsResult.status === 'fulfilled' ? quizSessionsResult.value.count || 0 : 0;
    const flashcardsCount = flashcardsResult.status === 'fulfilled' ? flashcardsResult.value.count || 0 : 0;
    const recentActivity = recentResult.status === 'fulfilled' ? recentResult.value.data || [] : [];

    return {
      totalSummaries: summariesCount,
      totalQuizzes: quizSessionsCount,
      totalFlashcards: flashcardsCount,
      recentActivity
    };
  }, []);

  return { fetchStats };
};
