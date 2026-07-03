
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Zap, ArrowRight, BookOpen, Lightbulb, ThumbsDown, ThumbsUp } from 'lucide-react';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface SwipeableFlashcardProps {
  currentCard: Flashcard;
  currentIndex: number;
  showFeedback: boolean;
  userChoice: 'correct' | 'incorrect' | null;
  onAnswer: (remembered: boolean) => void;
  onNextCard: () => void;
  isAnimating: boolean;
  xpEarned: number;
}

const SwipeableFlashcard = ({ 
  currentCard, 
  currentIndex, 
  showFeedback,
  userChoice,
  onAnswer, 
  onNextCard,
  isAnimating,
  xpEarned
}: SwipeableFlashcardProps) => {

  if (!showFeedback) {
    // QUESTION PHASE - Show question with answer buttons
    return (
      <div className="relative max-w-2xl mx-auto">
        <Card className="w-full border-0 shadow-2xl bg-background min-h-[500px]">
          <CardContent className="h-full flex flex-col justify-between p-6 md:p-8 min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <Badge className="text-base md:text-lg px-3 md:px-4 py-2 bg-primary/10 text-primary">
                🤔 Pergunta {currentIndex + 1}
              </Badge>
            </div>
            
            {/* Question */}
            <div className="flex-1 flex flex-col justify-center text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6 md:mb-8 leading-relaxed">
                {currentCard.pergunta}
              </h2>
            </div>
            
            {/* Answer Buttons */}
            <div className="space-y-4">
              <p className="text-center text-muted-foreground text-sm mb-4">
                Você lembra da resposta?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => !isAnimating && onAnswer(false)}
                  disabled={isAnimating}
                  variant="outline"
                  className="flex-1 h-14 text-base font-semibold border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-brand-orange/10"
                >
                  <ThumbsDown className="h-5 w-5 mr-2" />
                  😅 Não Lembrei
                  <Badge variant="outline" className="ml-2 text-xs border-amber-500 text-amber-700">
                    +2 XP
                  </Badge>
                </Button>
                
                <Button
                  onClick={() => !isAnimating && onAnswer(true)}
                  disabled={isAnimating}
                  className="flex-1 h-14 text-base font-semibold bg-accent text-accent-foreground hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  🎉 Lembrei!
                  <Badge variant="outline" className="ml-2 text-xs border-white/50 text-white">
                    +10 XP
                  </Badge>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FEEDBACK PHASE - Show feedback with correct answer
  const isCorrect = userChoice === 'correct';
  
  return (
    <div className="relative max-w-2xl mx-auto">
      <Card className={`w-full border-2 shadow-2xl min-h-[500px] transition-all duration-300 ${
        isCorrect 
          ? 'border-green-400 bg-muted/50' 
          : 'border-amber-400 bg-muted/50'
      }`}>
        <CardContent className="h-full flex flex-col p-6 md:p-8 min-h-[500px]">
          {/* Feedback Header */}
          <div className={`text-center p-4 rounded-xl mb-6 ${
            isCorrect ? 'bg-accent/15' : 'bg-brand-orange/15'
          }`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isCorrect ? 'bg-accent' : 'bg-brand-orange'
              }`}>
                {isCorrect ? (
                  <ThumbsUp className="h-6 w-6 text-white" />
                ) : (
                  <BookOpen className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h3 className={`text-xl md:text-2xl font-bold ${
                  isCorrect ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {isCorrect ? '🎉 Parabéns! Você lembrou!' : '💪 Continue estudando!'}
                </h3>
              </div>
            </div>
            
            {/* XP Badge */}
            <div className="flex items-center justify-center gap-2">
              <Zap className={`h-5 w-5 ${isCorrect ? 'text-green-600' : 'text-amber-600'}`} />
              <Badge className={`text-sm px-3 py-1 ${
                isCorrect 
                  ? 'bg-green-500 text-white' 
                  : 'bg-amber-500 text-white'
              }`}>
                +{xpEarned} XP {!isCorrect && 'por tentar'}
              </Badge>
            </div>
          </div>
          
          {/* Question Reminder */}
          <div className="bg-white/60 rounded-lg p-4 mb-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">📝 Pergunta:</p>
            <p className="text-foreground font-medium">{currentCard.pergunta}</p>
          </div>
          
          {/* Correct Answer */}
          <div className="flex-1 space-y-4">
            <div className={`rounded-xl p-5 border-2 ${
              isCorrect 
                ? 'bg-green-100/50 border-green-300' 
                : 'bg-background/80 border-amber-300'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCorrect ? 'bg-accent' : 'bg-brand-orange'
                }`}>
                  <span className="text-white text-lg">✓</span>
                </div>
                <h4 className={`font-semibold text-lg ${
                  isCorrect ? 'text-green-800' : 'text-amber-800'
                }`}>
                  {isCorrect ? 'Resposta Correta:' : 'A resposta é:'}
                </h4>
              </div>
              <p className="text-foreground text-base md:text-lg leading-relaxed pl-10">
                {currentCard.resposta}
              </p>
            </div>
            
            {/* Example if available */}
            {currentCard.exemplo && (
              <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-primary">Exemplo para fixar:</h4>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-7">
                  {currentCard.exemplo}
                </p>
              </div>
            )}
          </div>
          
          {/* Next Button */}
          <div className="mt-6">
            <Button
              onClick={onNextCard}
              className="w-full h-14 text-lg font-semibold bg-primary hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
            >
              Próximo Card
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwipeableFlashcard;
