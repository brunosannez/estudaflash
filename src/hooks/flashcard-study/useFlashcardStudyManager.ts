
import { useEffect, useCallback } from 'react';
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
    syncWithSession
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

  // Actions
  const { handleFlip, handleAnswer, getCurrentCard } = useFlashcardActions({
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
    onComplete: () => setIsCompleted(true)
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

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSessionId) {
        saveCurrentProgress();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && activeSessionId) {
        saveCurrentProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeSessionId]);

  const initializeSession = async () => {
    console.log('🔄 Initializing flashcard session:', { resumoId, sessionId });
    await createOrResumeSession(resumoId, sessionId);
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeSessionId) {
        saveCurrentProgress();
      }
    };
  }, []);

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
    handleFlip,
    handleAnswer,
    handleShuffle,
    getCurrentCard,
    saveCurrentProgress,
    completeSession,
    handleStudyAgain
  };
};
