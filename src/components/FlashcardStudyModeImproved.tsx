
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft } from 'lucide-react';
import { useFlashcardStudy } from '@/hooks/useFlashcardStudy';
import FlashcardStats from './flashcard-study/FlashcardStats';
import FlashcardProgress from './flashcard-study/FlashcardProgress';
import FlashcardContainer from './flashcard-study/FlashcardContainer';
import FlashcardControls from './flashcard-study/FlashcardControls';
import './FlashcardAnimations.css';

interface FlashcardStudyModeImprovedProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudyModeImproved = ({ resumoId, onBack }: FlashcardStudyModeImprovedProps) => {
  const {
    flashcards,
    currentIndex,
    showAnswer,
    loading,
    score,
    studyStats,
    isFlipped,
    completedCards,
    isAnimating,
    handleFlip,
    handleAnswer,
    handleShuffle,
    getCurrentCard
  } = useFlashcardStudy(resumoId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">🧠 Carregando flashcards mágicos...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card className="border-4 border-blue-200 shadow-xl overflow-hidden">
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            📚 Nenhum flashcard disponível
          </h3>
          <p className="text-gray-600 mb-6">
            Este resumo ainda não possui flashcards. Gere alguns para começar a estudar!
          </p>
          <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = getCurrentCard();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <FlashcardStats studyStats={studyStats} score={score} />
      
      <FlashcardProgress 
        currentIndex={currentIndex}
        totalCards={flashcards.length}
        completedCards={completedCards}
      />

      <FlashcardContainer
        currentCard={currentCard}
        currentIndex={currentIndex}
        showAnswer={showAnswer}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onAnswer={handleAnswer}
        isAnimating={isAnimating}
      />

      <FlashcardControls
        onBack={onBack}
        onShuffle={handleShuffle}
        onFlip={handleFlip}
        isAnimating={isAnimating}
      />
    </div>
  );
};

export default FlashcardStudyModeImproved;
