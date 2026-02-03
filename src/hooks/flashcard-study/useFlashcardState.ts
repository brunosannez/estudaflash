
import { useState } from 'react';

interface StudyStats {
  streak: number;
  totalReviewed: number;
  xpEarned: number;
}

interface Score {
  correct: number;
  incorrect: number;
}

export const useFlashcardState = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState<Score>({ correct: 0, incorrect: 0 });
  const [studyStats, setStudyStats] = useState<StudyStats>({ streak: 0, totalReviewed: 0, xpEarned: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
  // New states for feedback flow
  const [showFeedback, setShowFeedback] = useState(false);
  const [userChoice, setUserChoice] = useState<'correct' | 'incorrect' | null>(null);
  const [lastXpEarned, setLastXpEarned] = useState(0);

  const resetFlipState = () => {
    setShowAnswer(false);
    setIsFlipped(false);
    setShowFeedback(false);
    setUserChoice(null);
    setLastXpEarned(0);
  };

  const updateStats = (newStats: StudyStats) => {
    setStudyStats(newStats);
  };

  const updateScore = (newScore: Score) => {
    setScore(newScore);
  };

  const addCompletedCard = (cardId: string) => {
    setCompletedCards(prev => new Set([...prev, cardId]));
  };

  const syncWithSession = (sessionCurrentIndex: number, sessionCompletedCards: string[], sessionStats: any) => {
    setCurrentIndex(sessionCurrentIndex);
    setCompletedCards(new Set(sessionCompletedCards));
    setStudyStats({
      streak: sessionStats.streak,
      totalReviewed: sessionStats.totalReviewed,
      xpEarned: sessionStats.xpEarned
    });
    setScore({
      correct: sessionStats.correct,
      incorrect: sessionStats.incorrect
    });
  };

  return {
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
    // New feedback states
    showFeedback,
    setShowFeedback,
    userChoice,
    setUserChoice,
    lastXpEarned,
    setLastXpEarned
  };
};
