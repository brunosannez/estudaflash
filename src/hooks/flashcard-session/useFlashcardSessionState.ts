
import { useState, useRef } from 'react';

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

export const useFlashcardSessionState = () => {
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

  const updateState = (updates: Partial<SessionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
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
  };

  return {
    state,
    updateState,
    resetState,
    sessionInitialized,
    lastSessionId
  };
};
