
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuizHistoryItem {
  session_id: string;
  resumo_id: string;
  resumo_titulo: string;
  quiz_title: string;
  status: string;
  total_questions: number;
  correct_answers: number;
  progress_percentage: number;
  created_at: string;
  last_activity_at: string;
  completion_time_seconds: number | null;
  can_resume: boolean;
}

export const useRealTimeQuizHistory = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizHistory = useCallback(async () => {
    try {
      console.log('📚 Fetching quiz history...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_enhanced_quiz_history', {
        target_user_id: user.id
      });

      if (error) throw error;

      console.log('✅ Quiz history loaded:', data?.length || 0, 'sessions');
      setQuizHistory(data || []);
      setError(null);

    } catch (err) {
      console.error('❌ Error fetching quiz history:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  // Set up real-time subscription
  useEffect(() => {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return;

    console.log('🔄 Setting up quiz history real-time subscription...');

    const channel = supabase
      .channel('quiz_history_realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quiz_sessions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('📡 Quiz session updated via realtime:', payload);
          fetchQuizHistory();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'quiz_attempts',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('📡 Quiz attempt updated via realtime:', payload);
          fetchQuizHistory();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up quiz history subscription');
      supabase.removeChannel(channel);
    };
  }, [fetchQuizHistory]);

  const deleteQuizSession = useCallback(async (sessionId: string) => {
    try {
      console.log('🗑️ Deleting quiz session:', sessionId);
      
      // Delete attempts first
      await supabase
        .from('quiz_attempts')
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      console.log('✅ Quiz session deleted successfully');
      
      // Refresh history
      await fetchQuizHistory();
      
      return true;
    } catch (err) {
      console.error('❌ Error deleting quiz session:', err);
      return false;
    }
  }, [fetchQuizHistory]);

  return {
    quizHistory,
    loading,
    error,
    refreshHistory: fetchQuizHistory,
    deleteQuizSession
  };
};
