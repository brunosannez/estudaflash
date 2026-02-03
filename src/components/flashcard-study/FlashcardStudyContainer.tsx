
import React from 'react';
import FlashcardStats from './FlashcardStats';
import FlashcardProgress from './FlashcardProgress';
import FlashcardContainer from './FlashcardContainer';
import FlashcardControls from './FlashcardControls';
import FlashcardSessionStatus from './FlashcardSessionStatus';
import FlashcardKeyboardHints from './FlashcardKeyboardHints';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface StudyStats {
  streak: number;
  totalReviewed: number;
  xpEarned: number;
}

interface Score {
  correct: number;
  incorrect: number;
}

interface FlashcardStudyContainerProps {
  flashcards: Flashcard[];
  currentIndex: number;
  showFeedback: boolean;
  userChoice: 'correct' | 'incorrect' | null;
  score: Score;
  studyStats: StudyStats;
  completedCards: Set<string>;
  isAnimating: boolean;
  xpEarned: number;
  realGamificationData: any;
  sessionId: string | null;
  lastSaved?: Date;
  isOnline: boolean;
  onBack: () => void;
  onShuffle: () => void;
  onAnswer: (remembered: boolean) => void;
  onNextCard: () => void;
  getCurrentCard: () => Flashcard;
}

const FlashcardStudyContainer = ({
  flashcards,
  currentIndex,
  showFeedback,
  userChoice,
  score,
  studyStats,
  completedCards,
  isAnimating,
  xpEarned,
  realGamificationData,
  sessionId,
  lastSaved,
  isOnline,
  onBack,
  onShuffle,
  onAnswer,
  onNextCard,
  getCurrentCard
}: FlashcardStudyContainerProps) => {
  const currentCard = getCurrentCard();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <FlashcardStats 
        studyStats={studyStats} 
        score={score} 
        realGamificationData={realGamificationData}
      />
      
      <FlashcardProgress 
        currentIndex={currentIndex}
        totalCards={flashcards.length}
        completedCards={completedCards}
        studyStats={studyStats}
        score={score}
      />

      <FlashcardContainer
        currentCard={currentCard}
        currentIndex={currentIndex}
        showFeedback={showFeedback}
        userChoice={userChoice}
        onAnswer={onAnswer}
        onNextCard={onNextCard}
        isAnimating={isAnimating}
        xpEarned={xpEarned}
      />

      <FlashcardControls
        onBack={onBack}
        onShuffle={onShuffle}
        isAnimating={isAnimating}
      />
      
      <FlashcardSessionStatus
        sessionId={sessionId}
        lastSaved={lastSaved}
        isOnline={isOnline}
      />
      
      <FlashcardKeyboardHints />
    </div>
  );
};

export default FlashcardStudyContainer;
