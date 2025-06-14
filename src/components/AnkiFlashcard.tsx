
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check, X, Brain } from 'lucide-react';

interface AnkiFlashcardProps {
  pergunta: string;
  resposta: string;
  exemplo?: string | null;
  onNext: () => void;
  onMarkReviewed: () => void;
  currentIndex: number;
  totalCards: number;
}

const AnkiFlashcard = ({ 
  pergunta, 
  resposta, 
  exemplo, 
  onNext, 
  onMarkReviewed,
  currentIndex,
  totalCards
}: AnkiFlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    onMarkReviewed();
    onNext();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center text-sm text-gray-600">
        Cartão {currentIndex + 1} de {totalCards}
      </div>
      
      <div className="perspective-1000">
        <div 
          className={`relative w-full h-80 transition-transform duration-700 preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Frente do cartão */}
          <Card className={`absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl ${
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
          <Card className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-xl ${
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
              <div className="mt-4 text-sm opacity-80">
                Clique para voltar à pergunta
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Controles */}
      {isFlipped && (
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={() => setIsFlipped(false)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Ver Pergunta
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Próximo Cartão
          </Button>
        </div>
      )}
    </div>
  );
};

export default AnkiFlashcard;
