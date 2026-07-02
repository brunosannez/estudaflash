import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, CheckCircle } from 'lucide-react';
import FlashcardPerformanceIndicator from './FlashcardPerformanceIndicator';

interface FlashcardProgressProps {
  currentIndex: number;
  totalCards: number;
  completedCards: Set<string>;
  studyStats?: {
    streak: number;
    totalReviewed: number;
  };
  score?: {
    correct: number;
    incorrect: number;
  };
}

const FlashcardProgress = ({ 
  currentIndex, 
  totalCards, 
  completedCards,
  studyStats,
  score 
}: FlashcardProgressProps) => {
  const getProgressPercentage = () => {
    if (totalCards === 0) return 0;
    return (completedCards.size / totalCards) * 100;
  };

  const getAccuracy = () => {
    if (!score || (score.correct + score.incorrect) === 0) return 0;
    return (score.correct / (score.correct + score.incorrect)) * 100;
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Progresso do Estudo
            </span>
            <Badge variant="secondary" className="text-sm font-medium">
              {currentIndex + 1} de {totalCards}
            </Badge>
          </div>
          <Progress value={getProgressPercentage()} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {completedCards.size} cards completados
            </span>
            <span>{Math.round(getProgressPercentage())}% concluído</span>
          </div>
        </CardContent>
      </Card>

      {studyStats && score && (
        <FlashcardPerformanceIndicator
          streak={studyStats.streak}
          accuracy={getAccuracy()}
          totalReviewed={studyStats.totalReviewed}
        />
      )}
    </div>
  );
};

export default FlashcardProgress;
