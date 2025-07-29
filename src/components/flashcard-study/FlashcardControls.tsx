
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shuffle } from 'lucide-react';

interface FlashcardControlsProps {
  onBack: () => void;
  onShuffle: () => void;
  isAnimating: boolean;
}

const FlashcardControls = ({ onBack, onShuffle, isAnimating }: FlashcardControlsProps) => {
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
    </div>
  );
};

export default FlashcardControls;
