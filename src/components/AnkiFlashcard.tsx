
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check, X, Brain, Star } from 'lucide-react';

interface AnkiFlashcardProps {
  pergunta: string;
  resposta: string;
  exemplo?: string | null;
  onNext: () => void;
  onMarkReviewed: () => void;
  onCorrectAnswer?: () => void;
  onIncorrectAnswer?: () => void;
  currentIndex: number;
  totalCards: number;
}

const AnkiFlashcard = ({ 
  pergunta, 
  resposta, 
  exemplo, 
  onNext, 
  onMarkReviewed,
  onCorrectAnswer,
  onIncorrectAnswer,
  currentIndex,
  totalCards
}: AnkiFlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCorrect = () => {
    setAnswered(true);
    onCorrectAnswer?.();
    onMarkReviewed();
    setTimeout(() => {
      setIsFlipped(false);
      setAnswered(false);
      onNext();
    }, 1500);
  };

  const handleIncorrect = () => {
    setAnswered(true);
    onIncorrectAnswer?.();
    onMarkReviewed();
    setTimeout(() => {
      setIsFlipped(false);
      setAnswered(false);
      onNext();
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center text-sm text-muted-foreground">
        Cartão {currentIndex + 1} de {totalCards}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="perspective-1000">
        <div 
          className={`relative w-full h-80 transition-transform duration-700 preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={!isFlipped ? handleFlip : undefined}
        >
          {/* Frente do cartão */}
          <Card className={`absolute inset-0 w-full h-full backface-hidden bg-primary text-white shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}>
            <div className="p-6 h-full flex flex-col justify-center items-center text-center">
              <Brain className="h-8 w-8 mb-4 opacity-80" />
              <h3 className="text-lg font-semibold mb-4">Pergunta:</h3>
              <p className="text-base leading-relaxed">{pergunta}</p>
              <div className="mt-6 text-sm opacity-80">
                Clique para ver a resposta
              </div>
            </div>
          </Card>

          {/* Verso do cartão */}
          <Card className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-emerald-600 text-white shadow-xl ${
            isFlipped ? '' : 'rotate-y-180'
          }`}>
            <div className="p-6 h-full flex flex-col justify-center text-center">
              <Check className="h-8 w-8 mb-4 mx-auto opacity-80" />
              <h3 className="text-lg font-semibold mb-4">Resposta:</h3>
              <p className="text-base leading-relaxed mb-4">{resposta}</p>
              {exemplo && (
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Exemplo:</strong> {exemplo}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Controles de gamificação */}
      {isFlipped && !answered && (
        <div className="mt-6 space-y-4">
          <div className="text-center text-white text-sm mb-4">
            Você lembrou da resposta?
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleIncorrect}
              variant="outline"
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 flex items-center gap-2"
            >
              <X className="h-5 w-5" />
              Não Lembrei
            </Button>
            <Button
              onClick={handleCorrect}
              size="lg"
              className="bg-emerald-600 hover:opacity-90 flex items-center gap-2"
            >
              <Star className="h-5 w-5" />
              Lembrei (+5 XP)
            </Button>
          </div>
        </div>
      )}

      {/* Feedback visual após resposta */}
      {answered && (
        <div className="mt-6 text-center">
          <div className="animate-bounce">
            {onCorrectAnswer ? (
              <div className="text-green-500 font-bold text-lg">
                🎉 +5 XP! Muito bem!
              </div>
            ) : (
              <div className="text-blue-500 font-bold text-lg">
                📚 Continue estudando!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botão para voltar à pergunta */}
      {isFlipped && !answered && (
        <div className="mt-4 text-center">
          <Button
            onClick={() => setIsFlipped(false)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground/80"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Ver Pergunta Novamente
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnkiFlashcard;
