
import { useCallback } from 'react';

export const useProgressCalculations = () => {
  const calculateXP = useCallback((flashcardCount: number, correctAnswers: number, incorrectAnswers: number) => {
    return (flashcardCount * 5) + (correctAnswers * 10) + (incorrectAnswers * 2);
  }, []);

  const calculateLevel = useCallback((totalXp: number) => {
    if (totalXp < 50) return 1;
    if (totalXp < 150) return 2;
    if (totalXp < 300) return 3;
    return Math.floor((totalXp - 300) / 200) + 4;
  }, []);

  return {
    calculateXP,
    calculateLevel
  };
};
