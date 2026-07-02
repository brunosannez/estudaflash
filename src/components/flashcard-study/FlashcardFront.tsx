
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface FlashcardFrontProps {
  question: string;
  currentIndex: number;
  onFlip: () => void;
  isAnimating: boolean;
}

const FlashcardFront = ({ question, currentIndex, onFlip, isAnimating }: FlashcardFrontProps) => {
  return (
    <Card className="w-full h-full border-0 shadow-2xl bg-background min-h-[500px]">
      <CardContent className="h-full flex flex-col justify-between p-8 min-h-[500px]">
        <div className="flex-1 flex flex-col justify-center text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <Badge className="text-lg px-4 py-2 bg-primary/10 text-primary">
              🤔 Pergunta {currentIndex + 1}
            </Badge>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 leading-relaxed">
            {question}
          </h2>
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">
            💡 Clique no card ou pressione Espaço para ver a resposta
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardFront;
