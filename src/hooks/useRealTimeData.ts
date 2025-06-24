
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
      if (!user) return;

      // Get summary count
      const { data: summaries, error: summaryError } = await supabase
        .from('resumos')
        .select('id', { count: 'exact' })
        .eq('upload_id', user.id);

      if (summaryError) throw summaryError;

      // Get completed quiz sessions count
      const { data: quizSessions, error: quizError } = await supabase
        .from('quiz_sessions')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (quizError) throw quizError;

      // Get flashcard count
      const { data: flashcards, error: flashcardError } = await supabase
        .from('flashcards')
        .select('id', { count: 'exact' })
        .in('resumo_id', summaries?.map(s => s.id) || []);

      if (flashcardError) throw flashcardError;

      // Get recent activity
      const { data: recentQuizzes } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalSummaries: summaries?.length || 0,
        totalQuizzes: quizSessions?.length || 0,
        totalFlashcards: flashcards?.length || 0,
        recentActivity: recentQuizzes || [],
        loading: false,
        error: null
      });

      console.log('✅ Real-time stats updated:', {
        summaries: summaries?.length || 0,
        quizzes: quizSessions?.length || 0,
        flashcards: flashcards?.length || 0
      });

    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados'
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up real-time subscriptions
  useEffect(() => {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return;

    console.log('🔄 Setting up real-time subscriptions...');

    // Subscribe to quiz sessions changes
    const quizChannel = supabase
      .channel('quiz_sessions_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quiz_sessions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('📡 Quiz session changed via realtime:', payload);
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to resumos changes
    const resumoChannel = supabase
      .channel('resumos_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'resumos'
        }, 
        (payload) => {
          console.log('📡 Resumo changed via realtime:', payload);
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to flashcards changes
    const flashcardChannel = supabase
      .channel('flashcards_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'flashcards'
        }, 
        (payload) => {
          console.log('📡 Flashcard changed via realtime:', payload);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up real-time subscriptions');
      supabase.removeChannel(quizChannel);
      supabase.removeChannel(resumoChannel);
      supabase.removeChannel(flashcardChannel);
    };
  }, [fetchStats]);

  return {
    stats,
    refreshStats: fetchStats
  };
};
