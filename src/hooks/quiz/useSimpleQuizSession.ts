
import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuizSessionManager } from './useQuizSessionManager';
import { useQuizAnswerSaver } from './useQuizAnswerSaver';
import { useQuizProgressTracker } from './useQuizProgressTracker';

export const useSimpleQuizSession = () => {
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Add ref to prevent concurrent session operations
  const sessionOperationInProgress = useRef(false);

  const {
    sessionId,
    loading,
    error,
    totalQuestions,
    currentQuestionIndex: sessionQuestionIndex,
    correctAnswers: sessionCorrectAnswers,
    createOrResumeSession,
    resetSession
  } = useQuizSessionManager();

  const { saveAnswer } = useQuizAnswerSaver({
    sessionId,
    correctAnswers,
    onCorrectAnswersUpdate: setCorrectAnswers
  });

  const { advanceToNextQuestion, saveCurrentProgress } = useQuizProgressTracker({
    sessionId,
    currentQuestionIndex,
    totalQuestions,
    onQuestionIndexUpdate: setCurrentQuestionIndex
  });

  // Sync local state with session state when session loads (with debouncing)
  useEffect(() => {
    if (sessionId && !loading && !sessionOperationInProgress.current) {
      console.log('🔄 Syncing local state with session:', { sessionQuestionIndex, sessionCorrectAnswers });
      sessionOperationInProgress.current = true;
      
      // Use setTimeout to batch state updates
      setTimeout(() => {
        setCurrentQuestionIndex(sessionQuestionIndex);
        setCorrectAnswers(sessionCorrectAnswers);
        sessionOperationInProgress.current = false;
      }, 0);
    }
  }, [sessionId, loading, sessionQuestionIndex, sessionCorrectAnswers]);

  // Legacy function for backward compatibility (now just calls saveAnswer)
  const saveProgress = useCallback(async (questionIndex: number, selectedAnswer: number, isCorrect: boolean) => {
    return await saveAnswer(questionIndex, selectedAnswer, isCorrect);
  }, [saveAnswer]);

  // Enhanced auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        // Use synchronous approach for better reliability
        saveCurrentProgress();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionId) {
        saveCurrentProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, saveCurrentProgress]);

  // Reset local state when session resets
  useEffect(() => {
    if (!sessionId) {
      setCorrectAnswers(0);
      setCurrentQuestionIndex(0);
    }
  }, [sessionId]);

  return {
    sessionId,
    loading,
    error,
    currentQuestionIndex,
    correctAnswers,
    totalQuestions,
    createOrResumeSession,
    saveProgress,
    saveAnswer,
    advanceToNextQuestion,
    resetSession
  };
};
