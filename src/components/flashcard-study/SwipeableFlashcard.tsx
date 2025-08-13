import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, ChevronLeft, ChevronRight } from 'lucide-react';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface SwipeableFlashcardProps {
  currentCard: Flashcard;
  currentIndex: number;
  showAnswer: boolean;
  onFlip: () => void;
  onAnswer: (remembered: boolean) => void;
  isAnimating: boolean;
}

const SwipeableFlashcard = ({ 
  currentCard, 
  currentIndex, 
  showAnswer, 
  onFlip, 
  onAnswer, 
  isAnimating 
}: SwipeableFlashcardProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (showAnswer) {
      if (isLeftSwipe) {
        setSwipeDirection('left');
        setTimeout(() => {
          onAnswer(false); // Didn't remember
          setSwipeDirection(null);
        }, 150);
      } else if (isRightSwipe) {
        setSwipeDirection('right');
        setTimeout(() => {
          onAnswer(true); // Remembered
          setSwipeDirection(null);
        }, 150);
      }
    } else {
      // Any swipe flips the card
      if (isLeftSwipe || isRightSwipe) {
        onFlip();
      }
    }
  };

  useEffect(() => {
    setSwipeDirection(null);
  }, [currentIndex]);

  const getCardClass = () => {
    let baseClass = "flashcard-simple transition-all duration-300 transform-gpu";
    
    if (swipeDirection === 'left') {
      baseClass += " -translate-x-4 scale-95 opacity-80";
    } else if (swipeDirection === 'right') {
      baseClass += " translate-x-4 scale-95 opacity-80";
    } else if (!showAnswer) {
      baseClass += " cursor-pointer hover:scale-105 active:scale-95";
    }
    
    return baseClass;
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div 
        ref={cardRef}
        className={getCardClass()}
        onClick={showAnswer ? undefined : onFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Card className="w-full h-full border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-[500px]">
          <CardContent className="h-full flex flex-col justify-between p-6 md:p-8 min-h-[500px]">
            {!showAnswer ? (
              // Question Side
              <>
                <div className="flex-1 flex flex-col justify-center text-center">
                  <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                    </div>
                    <Badge className="text-base md:text-lg px-3 md:px-4 py-2 bg-primary/10 text-primary">
                      🤔 Pergunta {currentIndex + 1}
                    </Badge>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6 md:mb-8 leading-relaxed">
                    {currentCard.pergunta}
                  </h2>
                </div>
                
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    💡 Toque no card ou deslize para ver a resposta
                  </p>
                </div>
              </>
            ) : (
              // Answer Side
              <>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="text-center mb-6 md:mb-8">
                    <Badge className="text-base md:text-lg px-3 md:px-4 py-2 bg-success/10 text-success">
                      💡 Resposta
                    </Badge>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-background/80 rounded-lg p-4 md:p-6">
                      <p className="text-base md:text-lg text-foreground leading-relaxed">
                        {currentCard.resposta}
                      </p>
                    </div>
                    
                    {currentCard.exemplo && (
                      <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 md:p-6">
                        <h4 className="font-semibold text-primary mb-2">Exemplo:</h4>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {currentCard.exemplo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="hidden md:block text-center text-sm text-muted-foreground">
                    👈 Deslize para a esquerda se não lembrou | Deslize para a direita se lembrou 👉
                  </div>
                  
                  {/* Mobile buttons - visible on small screens */}
                  <div className="flex md:hidden space-x-3">
                    <Button
                      onClick={() => onAnswer(false)}
                      disabled={isAnimating}
                      variant="outline"
                      className="flex-1 h-12 text-base font-semibold border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      {isAnimating ? "..." : "Não Lembrei"}
                    </Button>
                    <Button
                      onClick={() => onAnswer(true)}
                      disabled={isAnimating}
                      className="flex-1 h-12 text-base font-semibold bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isAnimating ? "..." : "Lembrei"}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                  
                  {/* Desktop swipe indicators */}
                  <div className="hidden md:flex justify-between items-center px-4">
                    <div className="flex items-center space-x-2 text-destructive/70">
                      <ChevronLeft className="h-4 w-4" />
                      <span className="text-sm">Não lembrei</span>
                    </div>
                    <div className="flex items-center space-x-2 text-success/70">
                      <span className="text-sm">Lembrei</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SwipeableFlashcard;