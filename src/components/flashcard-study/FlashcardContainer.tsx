
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
    <div className="relative max-w-2xl mx-auto">
      <div className={`flashcard-simple transition-all duration-300 ${!showAnswer ? 'cursor-pointer hover:scale-105' : ''}`} onClick={showAnswer ? undefined : onFlip}>
        {!showAnswer && (
          <FlashcardFront
            question={currentCard.pergunta}
            currentIndex={currentIndex}
            onFlip={onFlip}
            isAnimating={isAnimating}
          />
        )}
        
        {showAnswer && (
          <FlashcardBack
            answer={currentCard.resposta}
            example={currentCard.exemplo}
            onAnswer={onAnswer}
            isAnimating={isAnimating}
          />
        )}
      </div>
    </div>
  );
};

export default FlashcardContainer;
