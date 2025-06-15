
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { designColors } from '@/utils/designSystem';

interface FlashcardStudyModeProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudyMode = ({ resumoId, onBack }: FlashcardStudyModeProps) => {
  const { cards, fetchFlashcards, reviewFlashcard, loading } = useFlashcards(resumoId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleMarkAsStudied = async (remembered: boolean = true) => {
    if (currentCard && !studiedCards.has(currentCard.id)) {
      await reviewFlashcard(currentCard.id, remembered);
      setStudiedCards(prev => new Set([...prev, currentCard.id]));
    }
    
    // Avançar para o próximo card automaticamente
    if (currentIndex < cards.length - 1) {
      handleNext();
    }
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setStudiedCards(new Set());
  };

  if (loading) {
    return (
      <div className={`${designColors.cards.primary} p-8 text-center`}>
        <div className="animate-spin text-4xl mb-4">🧠</div>
        <p className="text-lg font-semibold text-gray-600">Carregando flashcards mágicos...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className={`${designColors.cards.primary} p-8 text-center space-y-4`}>
        <div className="text-6xl">😔</div>
        <h3 className="text-xl font-bold text-gray-700">Nenhum flashcard encontrado</h3>
        <p className="text-gray-600">Gere flashcards primeiro para poder estudar!</p>
        <Button onClick={onBack} className={designColors.buttons.secondary}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / cards.length) * 100;
  const studiedPercentage = (studiedCards.size / cards.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className={`${designColors.cards.primary} p-4 flex justify-between items-center`}>
        <Button 
          onClick={onBack} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-600">
            {currentIndex + 1} de {cards.length}
          </div>
          <Button
            onClick={resetStudy}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </div>

      {/* Barras de progresso */}
      <div className={`${designColors.cards.primary} p-4 space-y-3`}>
        <div>
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Progresso da Sessão</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Cards Estudados ({studiedCards.size} XP ganhos!)</span>
            <span>{Math.round(studiedPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${studiedPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card principal */}
      <Card className={`${designColors.animations.cardHover} min-h-[400px] cursor-pointer`} onClick={handleFlip}>
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            {showAnswer ? 'Resposta' : 'Pergunta'}
            {studiedCards.has(currentCard?.id || '') && (
              <Sparkles className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center min-h-[300px] p-8">
          <div className="text-center space-y-4">
            <div className="text-lg md:text-xl font-medium leading-relaxed">
              {showAnswer ? currentCard?.resposta : currentCard?.pergunta}
            </div>
            
            {showAnswer && currentCard?.exemplo && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm font-semibold text-blue-800 mb-2">📝 Exemplo:</p>
                <p className="text-sm text-blue-700">{currentCard.exemplo}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-500 mt-6">
              {showAnswer ? '👆 Clique para ver a pergunta' : '👆 Clique para ver a resposta'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de navegação */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {showAnswer && (
          <div className="flex gap-3">
            <Button
              onClick={() => handleMarkAsStudied(false)}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              disabled={studiedCards.has(currentCard?.id || '')}
            >
              😕 Difícil (+5 XP)
            </Button>
            <Button
              onClick={() => handleMarkAsStudied(true)}
              className={`${designColors.buttons.primary} text-white`}
              disabled={studiedCards.has(currentCard?.id || '')}
            >
              😊 Fácil (+5 XP)
            </Button>
          </div>
        )}

        <Button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Estatísticas finais */}
      {studiedCards.size === cards.length && (
        <div className={`${designColors.cards.accent} p-6 text-center`}>
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Parabéns! Sessão Completa!
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            Você ganhou {studiedCards.size * 5} XP estudando {studiedCards.size} flashcards!
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={resetStudy} className={designColors.buttons.secondary}>
              🔄 Estudar Novamente
            </Button>
            <Button onClick={onBack} className={designColors.buttons.primary}>
              ✨ Continuar Aprendendo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardStudyMode;
