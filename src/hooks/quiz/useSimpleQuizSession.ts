
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionState {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  correctAnswers: number;
  totalQuestions: number;
}

export const useSimpleQuizSession = () => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: false,
    error: null,
    currentQuestionIndex: 0,
    correctAnswers: 0,
    totalQuestions: 0
  });
  
  const sessionInitialized = useRef(false);
  const lastSessionId = useRef<string | null>(null);

  const createOrResumeSession = useCallback(async (resumoId: string, questoes: any[], sessionId?: string) => {
    // Prevent multiple calls with same parameters
    if (state.loading || (sessionId && lastSessionId.current === sessionId)) {
      return state.sessionId;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    lastSessionId.current = sessionId || null;
    
    try {
      console.log('🚀 Creating/resuming quiz session:', { resumoId, sessionId, questionsCount: questoes.length });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let finalSessionId = sessionId;
      let currentIndex = 0;
      let correctCount = 0;

      // If resuming, validate and load session data
      if (sessionId) {
        const { data: existingSession, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (sessionError || !existingSession) {
          console.warn('⚠️ Session not found, creating new one');
          finalSessionId = null;
        } else {
          console.log('✅ Loading existing session data:', existingSession);
          currentIndex = existingSession.current_question_index || 0;
          correctCount = existingSession.correct_answers || 0;
          
          // Ensure we don't exceed available questions
          if (currentIndex >= questoes.length) {
            currentIndex = questoes.length - 1;
          }
        }
      }

      // Create new session if needed
      if (!finalSessionId) {
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
        finalSessionId = newSession.id;
        currentIndex = 0;
        correctCount = 0;
        console.log('✅ New session created:', finalSessionId);
      }

      setState({
        sessionId: finalSessionId,
        loading: false,
        error: null,
        currentQuestionIndex: currentIndex,
        correctAnswers: correctCount,
        totalQuestions: questoes.length
      });

      sessionInitialized.current = true;
      return finalSessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão';
      console.error('❌ Session error:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error('Erro ao iniciar quiz');
      return null;
    }
  }, [state.loading, state.sessionId]);

  const saveProgress = useCallback(async (questionIndex: number, selectedAnswer: number, isCorrect: boolean) => {
    if (!state.sessionId) return false;

    try {
      console.log('💾 Saving progress:', { questionIndex, selectedAnswer, isCorrect });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newCorrectAnswers = isCorrect ? state.correctAnswers + 1 : state.correctAnswers;
      const newQuestionIndex = questionIndex + 1;
      const progressPercentage = Math.round((newQuestionIndex / state.totalQuestions) * 100);

      // Update session progress
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          current_question_index: newQuestionIndex,
          correct_answers: newCorrectAnswers,
          progress_percentage: progressPercentage,
          last_activity_at: new Date().toISOString(),
          status: progressPercentage >= 100 ? 'completed' : 'in_progress'
        })
        .eq('id', state.sessionId);

      if (updateError) throw updateError;

      // Update local state
      setState(prev => ({
        ...prev,
        currentQuestionIndex: newQuestionIndex,
        correctAnswers: newCorrectAnswers
      }));

      console.log('✅ Progress saved successfully');
      return true;
    } catch (err) {
      console.error('❌ Save progress error:', err);
      toast.error('Erro ao salvar progresso');
      return false;
    }
  }, [state.sessionId, state.correctAnswers, state.totalQuestions]);

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting session state');
    setState({
      sessionId: null,
      loading: false,
      error: null,
      currentQuestionIndex: 0,
      correctAnswers: 0,
      totalQuestions: 0
    });
    sessionInitialized.current = false;
    lastSessionId.current = null;
  }, []);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.sessionId) {
        navigator.sendBeacon('/api/save-quiz-progress', JSON.stringify({
          sessionId: state.sessionId,
          currentIndex: state.currentQuestionIndex,
          correctAnswers: state.correctAnswers
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.sessionId, state.currentQuestionIndex, state.correctAnswers]);

  return {
    ...state,
    createOrResumeSession,
    saveProgress,
    resetSession
  };
};
