
import { useState, useCallback, useEffect } from 'react';
import { useQuizSessionManager } from './useQuizSessionManager';
import { useQuizAnswerSaver } from './useQuizAnswerSaver';
import { useQuizProgressTracker } from './useQuizProgressTracker';

export const useSimpleQuizSession = () => {
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const {
    sessionId,
    loading,
    error,
    totalQuestions,
    createOrResumeSession,
    resetSession
  } = useQuizSessionManager();

  const { saveAnswer } = useQuizAnswerSaver({
    sessionId,
    correctAnswers,
    onCorrectAnswersUpdate: setCorrectAnswers
  });

  const { advanceToNextQuestion } = useQuizProgressTracker({
    sessionId,
    currentQuestionIndex,
    totalQuestions,
    onQuestionIndexUpdate: setCurrentQuestionIndex
  });

  // Legacy function for backward compatibility (now just calls saveAnswer)
  const saveProgress = useCallback(async (questionIndex: number, selectedAnswer: number, isCorrect: boolean) => {
    return await saveAnswer(questionIndex, selectedAnswer, isCorrect);
  }, [saveAnswer]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        navigator.sendBeacon('/api/save-quiz-progress', JSON.stringify({
          sessionId: sessionId,
          currentIndex: currentQuestionIndex,
          correctAnswers: correctAnswers
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, currentQuestionIndex, correctAnswers]);

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
