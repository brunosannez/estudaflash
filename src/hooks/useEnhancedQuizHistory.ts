
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedQuizHistoryItem {
  session_id: string;
  resumo_id: string;
  resumo_titulo: string;
  quiz_title: string;
  status: 'in_progress' | 'completed' | 'paused';
  total_questions: number;
  correct_answers: number;
  progress_percentage: number;
  created_at: string;
  last_activity_at: string;
  completion_time_seconds?: number;
  can_resume: boolean;
}

interface QuizStats {
  totalQuizzes: number;
  completedQuizzes: number;
  inProgressQuizzes: number;
  totalAcertos: number;
  totalPerguntas: number;
  mediaAcertos: number;
}

export const useEnhancedQuizHistory = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<EnhancedQuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    completedQuizzes: 0,
    inProgressQuizzes: 0,
    totalAcertos: 0,
    totalPerguntas: 0,
    mediaAcertos: 0
  });

  const fetchEnhancedQuizHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ User not authenticated for enhanced quiz history');
        setHistory([]);
        setStats({
          totalQuizzes: 0,
          completedQuizzes: 0,
          inProgressQuizzes: 0,
          totalAcertos: 0,
          totalPerguntas: 0,
          mediaAcertos: 0
        });
        return;
      }

      console.log('🔍 Fetching enhanced quiz history for user:', user.id);

      // Use the new database function for enhanced data
      const { data: historyData, error } = await supabase
        .rpc('get_enhanced_quiz_history', { target_user_id: user.id });

      if (error) {
        console.error("❌ Error fetching enhanced quiz history:", error);
        throw error;
      }

      console.log('📊 Enhanced quiz history data from database:', {
        count: historyData?.length || 0,
        data: historyData
      });

      if (!historyData || historyData.length === 0) {
        console.log('ℹ️ No quiz sessions found for user');
        setHistory([]);
        setStats({
          totalQuizzes: 0,
          completedQuizzes: 0,
          inProgressQuizzes: 0,
          totalAcertos: 0,
          totalPerguntas: 0,
          mediaAcertos: 0
        });
        return;
      }

      // Transform data for frontend use
      const historyArray: EnhancedQuizHistoryItem[] = historyData.map(session => ({
        session_id: session.session_id,
        resumo_id: session.resumo_id,
        resumo_titulo: session.resumo_titulo,
        quiz_title: session.quiz_title,
        status: session.status as 'in_progress' | 'completed' | 'paused',
        total_questions: session.total_questions || 0,
        correct_answers: session.correct_answers || 0,
        progress_percentage: Number(session.progress_percentage) || 0,
        created_at: session.created_at,
        last_activity_at: session.last_activity_at,
        completion_time_seconds: session.completion_time_seconds,
        can_resume: session.can_resume
      }));

      console.log('✅ Processed enhanced quiz history:', {
        totalSessions: historyArray.length,
        sessions: historyArray
      });
      
      setHistory(historyArray);
      
      // Calculate enhanced statistics
      const totalQuizzes = historyArray.length;
      const completedQuizzes = historyArray.filter(quiz => quiz.status === 'completed').length;
      const inProgressQuizzes = historyArray.filter(quiz => quiz.status === 'in_progress').length;
      const totalAcertos = historyArray.reduce((acc, quiz) => acc + (quiz.correct_answers || 0), 0);
      const totalPerguntas = historyArray.reduce((acc, quiz) => acc + (quiz.total_questions || 0), 0);
      const mediaAcertos = totalPerguntas > 0 ? Math.round((totalAcertos / totalPerguntas) * 100) : 0;

      const calculatedStats = {
        totalQuizzes,
        completedQuizzes,
        inProgressQuizzes,
        totalAcertos,
        totalPerguntas,
        mediaAcertos
      };

      console.log('📈 Calculated enhanced statistics:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error("❌ Error loading enhanced quiz history:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu histórico de quizzes.",
        variant: "destructive",
      });
      setHistory([]);
      setStats({
        totalQuizzes: 0,
        completedQuizzes: 0,
        inProgressQuizzes: 0,
        totalAcertos: 0,
        totalPerguntas: 0,
        mediaAcertos: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const resumeQuiz = async (sessionId: string) => {
    try {
      console.log('🔄 Resuming quiz session:', sessionId);
      
      // Get session details
      const { data: sessionData, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !sessionData) {
        throw new Error('Sessão de quiz não encontrada');
      }

      // Navigate to quiz with session context
      return {
        sessionId,
        resumoId: sessionData.resumo_id,
        currentQuestionIndex: sessionData.current_question_index || 0,
        status: sessionData.status
      };
    } catch (error) {
      console.error('❌ Error resuming quiz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível retomar o quiz.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteQuizSession = async (sessionId: string) => {
    try {
      console.log('🗑️ Deleting quiz session:', sessionId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Delete quiz attempts first (due to foreign key)
      const { error: attemptsError } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('session_id', sessionId);

      if (attemptsError) {
        console.error('❌ Error deleting quiz attempts:', attemptsError);
        throw attemptsError;
      }

      // Delete the quiz session
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId);

      if (sessionError) {
        console.error('❌ Error deleting quiz session:', sessionError);
        throw sessionError;
      }

      console.log('✅ Quiz session deleted successfully');
      toast({
        title: "Sucesso",
        description: "Quiz excluído do histórico com sucesso!",
      });

      // Refresh history
      await fetchEnhancedQuizHistory();
    } catch (error) {
      console.error('❌ Error deleting quiz session:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir quiz do histórico.",
        variant: "destructive",
      });
    }
  };

  // Setup real-time updates
  useEffect(() => {
    console.log('🔄 Setting up enhanced quiz history with real-time updates');
    fetchEnhancedQuizHistory();

    // Configure listeners for real-time updates
    const sessionsChannel = supabase
      .channel('enhanced-quiz-history-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions'
        },
        (payload) => {
          console.log('🔄 Real-time quiz sessions update received:', payload);
          fetchEnhancedQuizHistory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_attempts'
        },
        (payload) => {
          console.log('🔄 Real-time quiz attempts update received:', payload);
          fetchEnhancedQuizHistory();
        }
      )
      .subscribe((status) => {
        console.log('📡 Enhanced real-time subscription status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up enhanced quiz history real-time subscription');
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  return {
    history,
    stats,
    loading,
    fetchEnhancedQuizHistory,
    resumeQuiz,
    deleteQuizSession
  };
};
