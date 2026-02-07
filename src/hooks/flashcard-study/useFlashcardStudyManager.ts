
import { useEffect, useCallback, useState, useRef } from 'react';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { useRealGamificationData } from '@/hooks/useRealGamificationData';
import { useFlashcardData } from './useFlashcardData';
import { useFlashcardState } from './useFlashcardState';
import { useFlashcardActions } from './useFlashcardActions';
import { useToast } from '@/hooks/use-toast';

export const useFlashcardStudyManager = (resumoId: string, sessionId?: string) => {
  const { toast } = useToast();
  const realGamificationData = useRealGamificationData();
  
  // Data fetching
  const { flashcards, loading: dataLoading, shuffleFlashcards } = useFlashcardData(resumoId);
  
  // State management
  const {
    currentIndex,
    setCurrentIndex,
    showAnswer,
    setShowAnswer,
    score,
    studyStats,
    isFlipped,
    setIsFlipped,
    completedCards,
    isAnimating,
    setIsAnimating,
    resetFlipState,
    updateStats,
    updateScore,
    addCompletedCard,
    syncWithSession,
    showFeedback,
    setShowFeedback,
    userChoice,
    setUserChoice,
    lastXpEarned,
    setLastXpEarned
  } = useFlashcardState();

  // Session management
  const {
    sessionId: activeSessionId,
    loading: sessionLoading,
    currentCardIndex: sessionCurrentIndex,
    completedCards: sessionCompletedCards,
    sessionStats,
    createOrResumeSession,
    saveProgress,
    completeSession,
    resetSession
  } = useFlashcardSession();

  // Study completion state
  const [isCompleted, setIsCompleted] = useState(false);

  // Refs for cleanup to avoid stale closures
  const activeSessionIdRef = useRef<string | null>(null);
  const currentIndexRef = useRef(0);
  const completedCardsRef = useRef<Set<string>>(new Set());
  const studyStatsRef = useRef(studyStats);
  const scoreRef = useRef(score);
  const saveProgressRef = useRef(saveProgress);

  // Keep refs in sync
  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { completedCardsRef.current = completedCards; }, [completedCards]);
  useEffect(() => { studyStatsRef.current = studyStats; }, [studyStats]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { saveProgressRef.current = saveProgress; }, [saveProgress]);

  // Actions
  const { handleFlip, handleAnswer, handleNextCard, getCurrentCard } = useFlashcardActions({
    flashcards,
    currentIndex,
    setCurrentIndex,
    showAnswer,
    setShowAnswer,
    isFlipped,
    setIsFlipped,
    isAnimating,
    setIsAnimating,
    studyStats,
    score,
    updateStats,
    updateScore,
    addCompletedCard,
    completedCards,
    saveProgress,
    realGamificationData,
    onComplete: () => setIsCompleted(true),
    setShowFeedback,
    setUserChoice,
    setLastXpEarned
  });

  // Initialize session once flashcards are loaded
  useEffect(() => {
    if (flashcards.length > 0 && !activeSessionId && !sessionLoading) {
      initializeSession();
    }
  }, [flashcards.length, activeSessionId, sessionLoading]);

  // Sync with session state
  useEffect(() => {
    if (activeSessionId && !sessionLoading) {
      console.log('🔄 Syncing with session state:', { sessionCurrentIndex, sessionStats });
      syncWithSession(sessionCurrentIndex, sessionCompletedCards, sessionStats);
    }
  }, [activeSessionId, sessionLoading, sessionCurrentIndex, sessionCompletedCards, sessionStats]);

  // Auto-save on page unload / visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSessionIdRef.current) {
        saveCurrentProgressFromRef();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && activeSessionIdRef.current) {
        saveCurrentProgressFromRef();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // empty deps is fine — we use refs

  const initializeSession = async () => {
    console.log('🔄 Initializing flashcard session:', { resumoId, sessionId });
    await createOrResumeSession(resumoId, sessionId);
  };

  // Ref-based save for cleanup/unmount (no stale closure)
  const saveCurrentProgressFromRef = useCallback(async () => {
    const sid = activeSessionIdRef.current;
    if (!sid) return;

    const updatedStats = {
      streak: studyStatsRef.current.streak,
      totalReviewed: studyStatsRef.current.totalReviewed,
      xpEarned: studyStatsRef.current.xpEarned,
      correct: scoreRef.current.correct,
      incorrect: scoreRef.current.incorrect
    };

    await saveProgressRef.current(
      currentIndexRef.current,
      Array.from(completedCardsRef.current),
      updatedStats
    );
  }, []);

  const saveCurrentProgress = useCallback(async () => {
    if (!activeSessionId) return;

    const updatedStats = {
      streak: studyStats.streak,
      totalReviewed: studyStats.totalReviewed,
      xpEarned: studyStats.xpEarned,
      correct: score.correct,
      incorrect: score.incorrect
    };

    await saveProgress(currentIndex, Array.from(completedCards), updatedStats);
  }, [activeSessionId, currentIndex, completedCards, studyStats, score, saveProgress]);

  const handleShuffle = () => {
    shuffleFlashcards();
    setCurrentIndex(0);
    resetFlipState();
    toast({
      title: "🎲 Cards embaralhados!",
      description: "Ordem dos flashcards foi alterada para variar o estudo.",
    });
  };

  // Cleanup on unmount — uses refs
  useEffect(() => {
    return () => {
      if (activeSessionIdRef.current) {
        saveCurrentProgressFromRef();
      }
    };
  }, [saveCurrentProgressFromRef]);

  const handleStudyAgain = () => {
    setIsCompleted(false);
    setCurrentIndex(0);
    resetFlipState();
  };

  return {
    flashcards,
    currentIndex,
    showAnswer,
    loading: dataLoading || sessionLoading,
    score,
    studyStats,
    isFlipped,
    completedCards,
    isAnimating,
    realGamificationData,
    sessionId: activeSessionId,
    isCompleted,
    showFeedback,
    userChoice,
    lastXpEarned,
    handleFlip,
    handleAnswer,
    handleNextCard,
    handleShuffle,
    getCurrentCard,
    saveCurrentProgress,
    completeSession,
    handleStudyAgain
  };
};
