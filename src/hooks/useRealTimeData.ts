
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeStats {
  totalSummaries: number;
  totalQuizzes: number;
  totalFlashcards: number;
  recentActivity: any[];
  loading: boolean;
  error: string | null;
}

export const useRealTimeData = () => {
  const [stats, setStats] = useState<RealTimeStats>({
    totalSummaries: 0,
    totalQuizzes: 0,
    totalFlashcards: 0,
    recentActivity: [],
    loading: true,
    error: null
  });

  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching real-time stats...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
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

      setStats({
        totalSummaries: summariesCount,
        totalQuizzes: quizSessionsCount,
        totalFlashcards: flashcardsCount,
        recentActivity,
        loading: false,
        error: null
      });

      console.log('✅ Real-time stats updated successfully');

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar dados'
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time subscriptions
  useEffect(() => {
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Setting up real-time subscriptions...');

      const channel = supabase
        .channel('dashboard_stats_realtime')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'quiz_sessions',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('📡 Quiz session changed, refreshing stats...');
            setTimeout(fetchStats, 1000);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'resumos'
          }, 
          () => {
            console.log('📡 Resumo changed, refreshing stats...');
            setTimeout(fetchStats, 1000);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'flashcard_reviews',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('📡 Flashcard review changed, refreshing stats...');
            setTimeout(fetchStats, 1000);
          }
        )
        .subscribe();

      return () => {
        console.log('🔌 Cleaning up real-time subscriptions');
        supabase.removeChannel(channel);
      };
    };

    setupSubscriptions();
  }, [fetchStats]);

  return {
    stats,
    refreshStats: fetchStats
  };
};
