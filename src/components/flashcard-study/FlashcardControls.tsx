
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shuffle, RotateCcw } from 'lucide-react';

interface FlashcardControlsProps {
  onBack: () => void;
  onShuffle: () => void;
  onFlip: () => void;
  isAnimating: boolean;
}

const FlashcardControls = ({ onBack, onShuffle, onFlip, isAnimating }: FlashcardControlsProps) => {
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <Button onClick={onBack} variant="outline" className="font-medium shadow-md">
        <ArrowLeft className="h-4 w-4 mr-2" />
        ⬅️ Voltar
      </Button>
      
      <Button onClick={onShuffle} variant="outline" className="font-medium shadow-md">
        <Shuffle className="h-4 w-4 mr-2" />
        🎲 Embaralhar
      </Button>
      
      <Button 
        onClick={onFlip} 
        disabled={isAnimating}
        variant="outline"
        className="font-medium shadow-md disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        🔄 Virar Card
      </Button>
    </div>
  );
};

export default FlashcardControls;
