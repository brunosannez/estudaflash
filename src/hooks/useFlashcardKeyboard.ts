
import { useEffect } from 'react';

interface FlashcardKeyboardProps {
  onFlip: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  onShuffle: () => void;
  showAnswer: boolean;
  isAnimating: boolean;
}

export const useFlashcardKeyboard = ({
  onFlip,
  onCorrect,
  onIncorrect,
  onShuffle,
  showAnswer,
  isAnimating
}: FlashcardKeyboardProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isAnimating) return;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          onFlip();
          break;
        case 'ArrowRight':
          if (showAnswer) {
            event.preventDefault();
            onCorrect();
          }
          break;
        case 'ArrowLeft':
          if (showAnswer) {
            event.preventDefault();
            onIncorrect();
          }
          break;
        case 's':
        case 'S':
          if (!showAnswer) {
            event.preventDefault();
            onShuffle();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onFlip, onCorrect, onIncorrect, onShuffle, showAnswer, isAnimating]);
};
