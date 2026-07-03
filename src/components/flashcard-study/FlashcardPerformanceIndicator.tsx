
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FlashcardPerformanceIndicatorProps {
  streak: number;
  accuracy: number;
  totalReviewed: number;
}

const FlashcardPerformanceIndicator = ({ 
  streak, 
  accuracy, 
  totalReviewed 
}: FlashcardPerformanceIndicatorProps) => {
  const getPerformanceIcon = () => {
    if (accuracy >= 80) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (accuracy >= 60) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getPerformanceColor = () => {
    if (accuracy >= 80) return 'border-accent/30 bg-accent/10';
    if (accuracy >= 60) return 'border-brand-orange/30 bg-brand-orange/10';
    return 'border-destructive/30 bg-destructive/10';
  };

  if (totalReviewed === 0) return null;

  return (
    <Card className={`${getPerformanceColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPerformanceIcon()}
            <span className="text-sm font-medium">Performance</span>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold">{accuracy.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              {streak > 0 && `🔥 ${streak} em sequência`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardPerformanceIndicator;
