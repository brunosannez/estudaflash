import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnemObjectiveQuestionProps {
  question: {
    enunciado: string;
    stem?: string;
    options: string[];
  };
  selectedAnswer: number;
  onAnswerSelect: (index: number) => void;
}

export const EnemObjectiveQuestion: React.FC<EnemObjectiveQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect
}) => {
  return (
    <div className="space-y-6">
      {/* Enunciado (Context) */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {question.enunciado}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stem (Question) */}
      {question.stem && (
        <div className="font-medium text-foreground">
          {question.stem}
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
              "hover:bg-accent/50 hover:border-accent-foreground/20",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              selectedAnswer === index
                ? "border-primary bg-primary/10 text-primary-foreground"
                : "border-border bg-card text-card-foreground"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold",
                selectedAnswer === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              )}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1 text-sm leading-relaxed">
                {option.replace(/^[A-E]\)\s*/, '')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};