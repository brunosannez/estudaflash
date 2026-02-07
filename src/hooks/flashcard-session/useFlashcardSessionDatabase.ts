
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFlashcardSessionDatabase = () => {
  const cleanupOldSessions = useCallback(async (resumoId: string, userId: string, keepSessionId?: string) => {
    try {
      let query = supabase
        .from('flashcard_sessions')
        .update({ status: 'abandoned', last_activity_at: new Date().toISOString() })
        .eq('resumo_id', resumoId)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (keepSessionId) {
        query = query.neq('id', keepSessionId);
      }

      const { error } = await query;
      if (error) {
        console.error('⚠️ Error cleaning up old sessions:', error);
      } else {
        console.log('🧹 Old sessions cleaned up for resumo:', resumoId);
      }
    } catch (e) {
      console.error('⚠️ Cleanup error:', e);
    }
  }, []);

  const createSession = useCallback(async (resumoId: string, userId: string) => {
    // Cleanup old active sessions before creating new one
    await cleanupOldSessions(resumoId, userId);

    const { data: newSession, error: sessionError } = await supabase
      .from('flashcard_sessions')
      .insert({
        user_id: userId,
        resumo_id: resumoId,
        current_card_index: 0,
        completed_cards: [],
        session_stats: {
          streak: 0,
          totalReviewed: 0,
          xpEarned: 0,
          correct: 0,
          incorrect: 0
        },
        status: 'active'
      })
      .select('id')
      .single();

    if (sessionError) throw sessionError;
    return newSession.id;
  }, [cleanupOldSessions]);

  const loadSession = useCallback(async (sessionId: string, userId: string) => {
    const { data: existingSession, error: sessionError } = await supabase
      .from('flashcard_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (sessionError || !existingSession) {
      return null;
    }

    return {
      currentIndex: existingSession.current_card_index || 0,
      completedCards: Array.isArray(existingSession.completed_cards) 
        ? existingSession.completed_cards as string[]
        : [],
      sessionStats: existingSession.session_stats && typeof existingSession.session_stats === 'object'
        ? existingSession.session_stats as any
        : {
            streak: 0,
            totalReviewed: 0,
            xpEarned: 0,
            correct: 0,
            incorrect: 0
          }
    };
  }, []);

  const saveProgress = useCallback(async (sessionId: string, cardIndex: number, completedCardIds: string[], stats: any) => {
    const { error } = await supabase
      .from('flashcard_sessions')
      .update({
        current_card_index: cardIndex,
        completed_cards: completedCardIds,
        session_stats: stats,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  }, []);

  const completeSession = useCallback(async (sessionId: string) => {
    const { error } = await supabase
      .from('flashcard_sessions')
      .update({
        status: 'completed',
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  }, []);

  return {
    createSession,
    loadSession,
    saveProgress,
    completeSession,
    cleanupOldSessions
  };
};
