import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnemVFQuestionProps {
  question: {
    enunciado: string;
    statements?: string[] | any; // Handle both string array and JSON from database
    options: string[] | any; // Handle both string array and JSON from database
  };
  selectedAnswer: number;
  onAnswerSelect: (index: number) => void;
}

export const EnemVFQuestion: React.FC<EnemVFQuestionProps> = ({
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

      {/* Statements */}
      {question.statements && (Array.isArray(question.statements) ? question.statements : []).length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">
            Analise as afirmações a seguir:
          </h4>
          <div className="space-y-2">
            {(Array.isArray(question.statements) ? question.statements : []).map((statement, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/20"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {statement.match(/^[IVX]+/)?.[0] || (index + 1)}
                </div>
                <div className="flex-1 text-sm leading-relaxed">
                  {statement.replace(/^[IVX]+\.\s*/, '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
        <strong>Instrução:</strong> Marque a alternativa que corresponde à sequência correta de verdadeiro (V) e falso (F) das afirmações apresentadas.
      </div>

      {/* Options */}
      <div className="space-y-3">
        {(Array.isArray(question.options) ? question.options : []).map((option, index) => (
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
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold",
                selectedAnswer === index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              )}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1 text-sm font-mono font-semibold tracking-wider">
                {option.replace(/^[A-E]\)\s*/, '')}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};