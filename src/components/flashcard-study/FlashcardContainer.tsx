
import React from 'react';
import SwipeableFlashcard from './SwipeableFlashcard';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface FlashcardContainerProps {
  currentCard: Flashcard;
  currentIndex: number;
  showFeedback: boolean;
  userChoice: 'correct' | 'incorrect' | null;
  onAnswer: (remembered: boolean) => void;
  onNextCard: () => void;
  isAnimating: boolean;
  xpEarned: number;
}

const FlashcardContainer = ({ 
  currentCard, 
  currentIndex, 
  showFeedback,
  userChoice,
  onAnswer, 
  onNextCard,
  isAnimating,
  xpEarned
}: FlashcardContainerProps) => {
  return (
    <SwipeableFlashcard
      currentCard={currentCard}
      currentIndex={currentIndex}
      showFeedback={showFeedback}
      userChoice={userChoice}
      onAnswer={onAnswer}
      onNextCard={onNextCard}
      isAnimating={isAnimating}
      xpEarned={xpEarned}
    />
  );
};

export default FlashcardContainer;
