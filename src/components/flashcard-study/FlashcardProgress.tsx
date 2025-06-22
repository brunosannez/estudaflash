
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface FlashcardProgressProps {
  currentIndex: number;
  totalCards: number;
  completedCards: Set<string>;
}

const FlashcardProgress = ({ currentIndex, totalCards, completedCards }: FlashcardProgressProps) => {
  const getProgressPercentage = () => {
    if (totalCards === 0) return 0;
    return (completedCards.size / totalCards) * 100;
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Progresso do Estudo
          </span>
          <Badge variant="secondary" className="text-sm font-medium">
            {currentIndex + 1} de {totalCards}
          </Badge>
        </div>
        <Progress value={getProgressPercentage()} className="h-3 mb-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{completedCards.size} cards completados</span>
          <span>{Math.round(getProgressPercentage())}% concluído</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardProgress;
