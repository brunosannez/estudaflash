
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFlashcardSessionState } from './useFlashcardSessionState';
import { useFlashcardSessionDatabase } from './useFlashcardSessionDatabase';

export const useFlashcardSessionManager = () => {
  const { state, updateState, resetState, sessionInitialized, lastSessionId } = useFlashcardSessionState();
  const { createSession, loadSession, saveProgress, completeSession } = useFlashcardSessionDatabase();

  const createOrResumeSession = useCallback(async (resumoId: string, sessionId?: string) => {
    if (state.loading || (sessionId && lastSessionId.current === sessionId)) {
      return state.sessionId;
    }

    updateState({ loading: true, error: null });
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
        const sessionData = await loadSession(sessionId, user.id);
        if (!sessionData) {
          console.warn('⚠️ Session not found, creating new one');
          finalSessionId = null;
        } else {
          console.log('✅ Loading existing session data:', sessionData);
          currentIndex = sessionData.currentIndex;
          completedCards = sessionData.completedCards;
          sessionStats = sessionData.sessionStats;
        }
      }

      // Create new session if needed
      if (!finalSessionId) {
        finalSessionId = await createSession(resumoId, user.id);
        console.log('✅ New flashcard session created:', finalSessionId);
      }

      updateState({
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
      updateState({
        loading: false,
        error: errorMessage
      });
      toast.error('Erro ao iniciar sessão de flashcards');
      return null;
    }
  }, [state.loading, state.sessionId, updateState, createSession, loadSession]);

  const saveCurrentProgress = useCallback(async (cardIndex: number, completedCardIds: string[], stats: any) => {
    if (!state.sessionId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      await saveProgress(state.sessionId, cardIndex, completedCardIds, stats);
      // Do NOT updateState here — local study state is the source of truth during active study.
      // Updating session state here would re-trigger sync and cause card skipping.
      console.log('💾 Flashcard progress saved');
      return true;
    } catch (err) {
      console.error('❌ Save progress error:', err);
      return false;
    }
  }, [state.sessionId, saveProgress]);

  const completeCurrentSession = useCallback(async () => {
    if (!state.sessionId) return false;

    try {
      await completeSession(state.sessionId);
      console.log('✅ Flashcard session completed');
      return true;
    } catch (err) {
      console.error('❌ Complete session error:', err);
      return false;
    }
  }, [state.sessionId, completeSession]);

  return {
    ...state,
    createOrResumeSession,
    saveProgress: saveCurrentProgress,
    completeSession: completeCurrentSession,
    resetSession: resetState
  };
};
