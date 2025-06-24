
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionState {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
}

export const useSimpleQuizSession = () => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: false,
    error: null
  });
  
  const sessionInitialized = useRef(false);

  const createOrResumeSession = useCallback(async (resumoId: string, questoes: any[], sessionId?: string) => {
    // Prevent multiple simultaneous session creations
    if (state.loading || sessionInitialized.current) {
      return state.sessionId;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    sessionInitialized.current = true;
    
    try {
      console.log('🚀 Creating/resuming quiz session:', { resumoId, sessionId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let finalSessionId = sessionId;

      // If resuming, validate the session exists
      if (sessionId) {
        const { data: existingSession } = await supabase
          .from('quiz_sessions')
          .select('id, status')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (!existingSession) {
          console.warn('⚠️ Session not found, creating new one');
          finalSessionId = null;
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
        console.log('✅ New session created:', finalSessionId);
      } else {
        console.log('✅ Resuming existing session:', finalSessionId);
      }

      setState({
        sessionId: finalSessionId,
        loading: false,
        error: null
      });

      return finalSessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão';
      console.error('❌ Session error:', errorMessage);
      setState({
        sessionId: null,
        loading: false,
        error: errorMessage
      });
      toast.error('Erro ao iniciar quiz');
      return null;
    }
  }, [state.loading, state.sessionId]);

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting session state');
    setState({
      sessionId: null,
      loading: false,
      error: null
    });
    sessionInitialized.current = false;
  }, []);

  return {
    ...state,
    createOrResumeSession,
    resetSession
  };
};
