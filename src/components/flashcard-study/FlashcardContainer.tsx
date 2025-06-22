
import React from 'react';
import FlashcardFront from './FlashcardFront';
import FlashcardBack from './FlashcardBack';

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
  return (
    <div className="relative perspective-1000">
      <div className={`flashcard-container ${isFlipped ? 'flipped' : ''} mx-auto max-w-2xl`}>
        <FlashcardFront
          question={currentCard.pergunta}
          currentIndex={currentIndex}
          onFlip={onFlip}
          isAnimating={isAnimating}
        />
        
        <FlashcardBack
          answer={currentCard.resposta}
          example={currentCard.exemplo}
          onAnswer={onAnswer}
          isAnimating={isAnimating}
        />
      </div>
    </div>
  );
};

export default FlashcardContainer;
