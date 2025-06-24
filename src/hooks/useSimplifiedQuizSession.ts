
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizSessionData {
  sessionId: string;
  resumoId: string;
  questoes: any[];
  currentQuestionIndex: number;
  correctAnswers: number;
  totalQuestions: number;
  isActive: boolean;
}

export const useSimplifiedQuizSession = () => {
  const [sessionData, setSessionData] = useState<QuizSessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (resumoId: string, questoes: any[]) => {
    if (loading || sessionData) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Creating new quiz session:', { resumoId, questionsCount: questoes.length });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Check for existing active session first
      const { data: existingSessions } = await supabase
        .from('quiz_sessions')
        .select('id, status, current_question_index, correct_answers')
        .eq('user_id', user.id)
        .eq('resumo_id', resumoId)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingSessions && existingSessions.length > 0) {
        const existingSession = existingSessions[0];
        console.log('📋 Found existing session, resuming:', existingSession.id);
        
        setSessionData({
          sessionId: existingSession.id,
          resumoId,
          questoes,
          currentQuestionIndex: existingSession.current_question_index || 0,
          correctAnswers: existingSession.correct_answers || 0,
          totalQuestions: questoes.length,
          isActive: true
        });
        
        setLoading(false);
        return existingSession.id;
      }

      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          resumo_id: resumoId,
          quiz_title: `Quiz - ${questoes.length} questões`,
          total_questions: questoes.length,
          correct_answers: 0,
          status: 'in_progress',
          current_question_index: 0,
          progress_percentage: 0,
          questions_data: questoes
        })
        .select('id')
        .single();

      if (sessionError) throw sessionError;

      console.log('✅ New session created:', newSession.id);

      setSessionData({
        sessionId: newSession.id,
        resumoId,
        questoes,
        currentQuestionIndex: 0,
        correctAnswers: 0,
        totalQuestions: questoes.length,
        isActive: true
      });

      return newSession.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão';
      console.error('❌ Session creation error:', errorMessage);
      setError(errorMessage);
      toast.error('Erro ao iniciar quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading, sessionData]);

  const resumeSession = useCallback(async (sessionId: string) => {
    if (loading) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Resuming session:', sessionId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) throw new Error('Sessão não encontrada');

      let questoes = [];
      if (typeof session.questions_data === 'string') {
        questoes = JSON.parse(session.questions_data);
      } else if (Array.isArray(session.questions_data)) {
        questoes = session.questions_data;
      }

      if (questoes.length === 0) {
        // Fallback: get questions from quizzes table
        const { data: quizzesData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('resumo_id', session.resumo_id)
          .order('data_criacao');

        if (quizzesData && quizzesData.length > 0) {
          questoes = quizzesData;
        }
      }

      if (questoes.length === 0) throw new Error('Nenhuma questão encontrada');

      console.log('✅ Session resumed successfully');

      setSessionData({
        sessionId: session.id,
        resumoId: session.resumo_id,
        questoes,
        currentQuestionIndex: session.current_question_index || 0,
        correctAnswers: session.correct_answers || 0,
        totalQuestions: questoes.length,
        isActive: session.status === 'in_progress'
      });

      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao retomar sessão';
      console.error('❌ Resume session error:', errorMessage);
      setError(errorMessage);
      toast.error('Erro ao retomar quiz');
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const saveProgress = useCallback(async (questionId: string, selectedAnswer: number, isCorrect: boolean) => {
    if (!sessionData) return false;

    try {
      console.log('💾 Saving progress:', { questionId, selectedAnswer, isCorrect });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Save individual attempt
      await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          session_id: sessionData.sessionId,
          resumo_id: sessionData.resumoId,
          quiz_question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect
        });

      // Update session progress
      const newCorrectAnswers = isCorrect ? sessionData.correctAnswers + 1 : sessionData.correctAnswers;
      const newQuestionIndex = sessionData.currentQuestionIndex + 1;
      const progressPercentage = Math.round((newQuestionIndex / sessionData.totalQuestions) * 100);

      await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: newQuestionIndex,
          correct_answers: newCorrectAnswers,
          progress_percentage: progressPercentage,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionData.sessionId);

      // Update local state
      setSessionData(prev => prev ? {
        ...prev,
        currentQuestionIndex: newQuestionIndex,
        correctAnswers: newCorrectAnswers
      } : null);

      console.log('✅ Progress saved successfully');
      return true;
    } catch (err) {
      console.error('❌ Save progress error:', err);
      toast.error('Erro ao salvar progresso');
      return false;
    }
  }, [sessionData]);

  const completeSession = useCallback(async () => {
    if (!sessionData) return null;

    try {
      console.log('🏁 Completing session:', sessionData.sessionId);

      await supabase
        .from('quiz_sessions')
        .update({
          status: 'completed',
          completion_time_seconds: Math.floor(Date.now() / 1000),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionData.sessionId);

      const result = {
        sessionId: sessionData.sessionId,
        correctAnswers: sessionData.correctAnswers,
        totalQuestions: sessionData.totalQuestions,
        accuracy: Math.round((sessionData.correctAnswers / sessionData.totalQuestions) * 100)
      };

      console.log('✅ Session completed:', result);
      
      setSessionData(prev => prev ? { ...prev, isActive: false } : null);
      return result;
    } catch (err) {
      console.error('❌ Complete session error:', err);
      toast.error('Erro ao finalizar quiz');
      return null;
    }
  }, [sessionData]);

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting session state');
    setSessionData(null);
    setError(null);
  }, []);

  return {
    sessionData,
    loading,
    error,
    createSession,
    resumeSession,
    saveProgress,
    completeSession,
    resetSession
  };
};
