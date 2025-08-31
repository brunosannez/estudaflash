import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UnifiedQuizSessionState {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  correctAnswers: number;
  totalQuestions: number;
  initialized: boolean;
}

export const useUnifiedQuizSession = () => {
  const [state, setState] = useState<UnifiedQuizSessionState>({
    sessionId: null,
    loading: false,
    error: null,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    initialized: false
  });

  // Prevent concurrent operations
  const operationInProgress = useRef(false);
  const initializationAttempted = useRef(false);

  const createOrResumeSession = useCallback(async (
    resumoId: string, 
    questoes: any[], 
    existingSessionId?: string
  ): Promise<string | null> => {
    if (operationInProgress.current) {
      console.warn('⚠️ Session operation already in progress');
      return state.sessionId;
    }

    if (initializationAttempted.current && state.sessionId) {
      console.log('✅ Session already initialized:', state.sessionId);
      return state.sessionId;
    }

    operationInProgress.current = true;
    initializationAttempted.current = true;

    try {
      console.log('🚀 Creating/resuming session:', { resumoId, existingSessionId, questionsCount: questoes.length });
      
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let sessionData;

      if (existingSessionId) {
        // Try to resume existing session
        const { data: existingSession, error: resumeError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', existingSessionId)
          .eq('user_id', user.id)
          .single();

        if (!resumeError && existingSession) {
          console.log('📝 Resuming existing session:', existingSession);
          sessionData = existingSession;
        }
      }

      if (!sessionData) {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('quiz_sessions')
          .insert({
            user_id: user.id,
            resumo_id: resumoId,
            total_questions: questoes.length,
            correct_answers: 0,
            questions_data: questoes,
            quiz_title: `Quiz - ${questoes.length} questões`,
            current_question_index: 0,
            status: 'in_progress'
          })
          .select()
          .single();

        if (createError) throw createError;
        sessionData = newSession;
        console.log('✅ New session created:', sessionData);
      }

      setState(prev => ({
        ...prev,
        sessionId: sessionData.id,
        currentQuestionIndex: sessionData.current_question_index || 0,
        correctAnswers: sessionData.correct_answers || 0,
        totalQuestions: sessionData.total_questions || questoes.length,
        loading: false,
        initialized: true
      }));

      return sessionData.id;

    } catch (error) {
      console.error('❌ Session creation/resume error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar sessão';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      
      return null;
    } finally {
      operationInProgress.current = false;
    }
  }, [state.sessionId]);

  const saveAnswer = useCallback(async (
    questionIndex: number,
    selectedAnswer: number,
    isCorrect: boolean
  ): Promise<boolean> => {
    if (!state.sessionId) {
      console.warn('⚠️ No active session to save answer');
      return false;
    }

    if (operationInProgress.current) {
      console.warn('⚠️ Operation in progress, skipping save');
      return false;
    }

    try {
      operationInProgress.current = true;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Save quiz attempt
      const { error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          session_id: state.sessionId,
          resumo_id: crypto.randomUUID(), // Will be updated to proper resumo_id later
          quiz_question_id: crypto.randomUUID(), // Generate temporary ID
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          answered_at: new Date().toISOString()
        });

      if (attemptError) {
        console.error('❌ Error saving attempt:', attemptError);
      }

      // Update session with new correct answers count
      const newCorrectAnswers = isCorrect ? state.correctAnswers + 1 : state.correctAnswers;
      
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .update({
          correct_answers: newCorrectAnswers,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', state.sessionId);

      if (sessionError) {
        console.error('❌ Error updating session:', sessionError);
      }

      // Update local state
      setState(prev => ({
        ...prev,
        correctAnswers: newCorrectAnswers
      }));

      return true;

    } catch (error) {
      console.error('❌ Error saving answer:', error);
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, [state.sessionId, state.correctAnswers]);

  const advanceToNextQuestion = useCallback(async (): Promise<boolean> => {
    if (!state.sessionId) return false;
    if (operationInProgress.current) return false;

    try {
      operationInProgress.current = true;

      const nextIndex = state.currentQuestionIndex + 1;
      
      const { error } = await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: nextIndex,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', state.sessionId);

      if (error) {
        console.error('❌ Error advancing question:', error);
        return false;
      }

      setState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex
      }));

      return true;

    } catch (error) {
      console.error('❌ Error advancing to next question:', error);
      return false;
    } finally {
      operationInProgress.current = false;
    }
  }, [state.sessionId, state.currentQuestionIndex]);

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting session state');
    setState({
      sessionId: null,
      loading: false,
      error: null,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      initialized: false
    });
    operationInProgress.current = false;
    initializationAttempted.current = false;
  }, []);

  // Auto-save progress on visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && state.sessionId && !operationInProgress.current) {
        try {
          // Save current progress
          await supabase
            .from('quiz_sessions')
            .update({
              last_activity_at: new Date().toISOString()
            })
            .eq('id', state.sessionId);
          console.log('💾 Progress auto-saved');
        } catch (error) {
          console.error('❌ Auto-save error:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.sessionId]);

  return {
    ...state,
    createOrResumeSession,
    saveAnswer,
    advanceToNextQuestion,
    resetSession
  };
};