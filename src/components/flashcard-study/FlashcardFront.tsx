
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RotateCcw } from 'lucide-react';

interface FlashcardFrontProps {
  question: string;
  currentIndex: number;
  onFlip: () => void;
  isAnimating: boolean;
}

const FlashcardFront = ({ question, currentIndex, onFlip, isAnimating }: FlashcardFrontProps) => {
  return (
    <Card className="flashcard-front absolute inset-0 w-full h-full border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <CardContent className="h-full flex flex-col justify-between p-8 min-h-[500px]">
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <Badge className="text-lg px-4 py-2 bg-purple-100 text-purple-700">
              🤔 Pergunta {currentIndex + 1}
            </Badge>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-relaxed">
            {question}
          </h2>
        </div>
        
        <Button 
          onClick={onFlip}
          disabled={isAnimating}
          size="lg"
          className="mx-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          🔄 Ver Resposta
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlashcardFront;
