
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyboard, X } from 'lucide-react';

const FlashcardKeyboardHints = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-background/90 shadow-lg hover:bg-card"
      >
        <Keyboard className="h-4 w-4 mr-2" />
        Atalhos
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-xl max-w-xs">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Atalhos do Teclado</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Virar card:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-foreground">Espaço</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lembrei:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-foreground">→</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Não lembrei:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-foreground">←</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Embaralhar:</span>
            <kbd className="px-2 py-1 bg-muted rounded text-foreground">S</kbd>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardKeyboardHints;
