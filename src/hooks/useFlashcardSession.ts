

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionState {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
  currentCardIndex: number;
  completedCards: string[];
  sessionStats: {
    streak: number;
    totalReviewed: number;
    xpEarned: number;
    correct: number;
    incorrect: number;
  };
}

export const useFlashcardSession = () => {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    loading: false,
    error: null,
    currentCardIndex: 0,
    completedCards: [],
    sessionStats: {
      streak: 0,
      totalReviewed: 0,
      xpEarned: 0,
      correct: 0,
      incorrect: 0
    }
  });
  
  const sessionInitialized = useRef(false);
  const lastSessionId = useRef<string | null>(null);

  const createOrResumeSession = useCallback(async (resumoId: string, sessionId?: string) => {
    if (state.loading || (sessionId && lastSessionId.current === sessionId)) {
      return state.sessionId;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    lastSessionId.current = sessionId || null;
    
    try {
      console.log('🚀 Creating/resuming flashcard session:', { resumoId, sessionId });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let finalSessionId = sessionId;
      let currentIndex = 0;
      let completedCards: string[] = [];
      let sessionStats = {
        streak: 0,
        totalReviewed: 0,
        xpEarned: 0,
        correct: 0,
        incorrect: 0
      };

      // If resuming, validate and load session data
      if (sessionId) {
        const { data: existingSession, error: sessionError } = await supabase
          .from('flashcard_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (sessionError || !existingSession) {
          console.warn('⚠️ Session not found, creating new one');
          finalSessionId = null;
        } else {
          console.log('✅ Loading existing session data:', existingSession);
          currentIndex = existingSession.current_card_index || 0;
          
          // Safely parse completed_cards
          if (Array.isArray(existingSession.completed_cards)) {
            completedCards = existingSession.completed_cards as string[];
          } else {
            completedCards = [];
          }
          
          // Safely parse session_stats
          if (existingSession.session_stats && typeof existingSession.session_stats === 'object') {
            const stats = existingSession.session_stats as any;
            sessionStats = {
              streak: stats.streak || 0,
              totalReviewed: stats.totalReviewed || 0,
              xpEarned: stats.xpEarned || 0,
              correct: stats.correct || 0,
              incorrect: stats.incorrect || 0
            };
          }
        }
      }

      // Create new session if needed
      if (!finalSessionId) {
        const { data: newSession, error: sessionError } = await supabase
          .from('flashcard_sessions')
          .insert({
            user_id: user.id,
            resumo_id: resumoId,
            current_card_index: 0,
            completed_cards: [],
            session_stats: sessionStats,
            status: 'active'
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;
        finalSessionId = newSession.id;
        console.log('✅ New flashcard session created:', finalSessionId);
      }

      setState({
        sessionId: finalSessionId,
        loading: false,
        error: null,
        currentCardIndex: currentIndex,
        completedCards,
        sessionStats
      });

      sessionInitialized.current = true;
      return finalSessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão';
      console.error('❌ Flashcard session error:', errorMessage);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      toast.error('Erro ao iniciar sessão de flashcards');
      return null;
    }
  }, [state.loading, state.sessionId]);

  const saveProgress = useCallback(async (cardIndex: number, completedCardIds: string[], stats: any) => {
    if (!state.sessionId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('flashcard_sessions')
        .update({
          current_card_index: cardIndex,
          completed_cards: completedCardIds,
          session_stats: stats,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', state.sessionId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        currentCardIndex: cardIndex,
        completedCards: completedCardIds,
        sessionStats: stats
      }));

      console.log('💾 Flashcard progress saved');
      return true;
    } catch (err) {
      console.error('❌ Save progress error:', err);
      return false;
    }
  }, [state.sessionId]);

  const completeSession = useCallback(async () => {
    if (!state.sessionId) return false;

    try {
      const { error } = await supabase
        .from('flashcard_sessions')
        .update({
          status: 'completed',
          last_activity_at: new Date().toISOString()
        })
        .eq('id', state.sessionId);

      if (error) throw error;

      console.log('✅ Flashcard session completed');
      return true;
    } catch (err) {
      console.error('❌ Complete session error:', err);
      return false;
    }
  }, [state.sessionId]);

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting flashcard session state');
    setState({
      sessionId: null,
      loading: false,
      error: null,
      currentCardIndex: 0,
      completedCards: [],
      sessionStats: {
        streak: 0,
        totalReviewed: 0,
        xpEarned: 0,
        correct: 0,
        incorrect: 0
      }
    });
    sessionInitialized.current = false;
    lastSessionId.current = null;
  }, []);

  return {
    ...state,
    createOrResumeSession,
    saveProgress,
    completeSession,
    resetSession
  };
};

