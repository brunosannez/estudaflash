
import React from 'react';
import SwipeableFlashcard from './SwipeableFlashcard';
import { useIsMobile } from '@/hooks/use-mobile';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface FlashcardContainerProps {
  currentCard: Flashcard;
  currentIndex: number;
  showAnswer: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (remembered: boolean) => void;
  isAnimating: boolean;
}

const FlashcardContainer = ({ 
  currentCard, 
  currentIndex, 
  showAnswer, 
  isFlipped, 
  onFlip, 
  onAnswer, 
  isAnimating 
}: FlashcardContainerProps) => {
  const isMobile = useIsMobile();

  // Use swipeable version for all devices but optimize for mobile
  return (
    <SwipeableFlashcard
      currentCard={currentCard}
      currentIndex={currentIndex}
      showAnswer={showAnswer}
      onFlip={onFlip}
      onAnswer={onAnswer}
      isAnimating={isAnimating}
    />
  );
};

export default FlashcardContainer;
