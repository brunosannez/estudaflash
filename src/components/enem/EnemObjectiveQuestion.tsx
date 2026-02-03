import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface EnemObjectiveQuestionProps {
  question: {
    enunciado: string;
    stem?: string;
    options: string[] | any;
  };
  selectedAnswer: number;
  onAnswerSelect: (index: number) => void;
  showFeedback?: boolean;
  correctIndex?: number;
  evidence?: string;
}

export const EnemObjectiveQuestion: React.FC<EnemObjectiveQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  showFeedback = false,
  correctIndex = -1,
  evidence = ''
}) => {
  const getOptionStyle = (index: number) => {
    if (!showFeedback) {
      // Normal selection state
      return selectedAnswer === index
        ? "border-primary bg-primary/10"
        : "border-border bg-card hover:bg-accent/50 hover:border-accent-foreground/20";
    }
    
    // Feedback mode
    const isCorrect = index === correctIndex;
    const isSelected = index === selectedAnswer;
    const userWasCorrect = selectedAnswer === correctIndex;
    
    if (isCorrect) {
      return "border-green-500 bg-green-50 dark:bg-green-950/30";
    }
    if (isSelected && !userWasCorrect) {
      return "border-red-500 bg-red-50 dark:bg-red-950/30";
    }
    return "border-border bg-muted/30 opacity-60";
  };

  const getCircleStyle = (index: number) => {
    if (!showFeedback) {
      return selectedAnswer === index
        ? "border-primary bg-primary text-primary-foreground"
        : "border-muted-foreground text-muted-foreground";
    }
    
    const isCorrect = index === correctIndex;
    const isSelected = index === selectedAnswer;
    const userWasCorrect = selectedAnswer === correctIndex;
    
    if (isCorrect) {
      return "border-green-500 bg-green-500 text-white";
    }
    if (isSelected && !userWasCorrect) {
      return "border-red-500 bg-red-500 text-white";
    }
    return "border-muted-foreground/50 text-muted-foreground/50";
  };

  const renderIcon = (index: number) => {
    if (!showFeedback) return null;
    
    const isCorrect = index === correctIndex;
    const isSelected = index === selectedAnswer;
    const userWasCorrect = selectedAnswer === correctIndex;
    
    if (isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
    }
    if (isSelected && !userWasCorrect) {
      return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
    }
    return null;
  };

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
        {(Array.isArray(question.options) ? question.options : []).map((option, index) => (
          <button
            key={index}
            onClick={() => !showFeedback && onAnswerSelect(index)}
            disabled={showFeedback}
            className={cn(
              "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
              !showFeedback && "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              showFeedback && "cursor-default",
              getOptionStyle(index)
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors",
                getCircleStyle(index)
              )}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="flex-1 text-sm leading-relaxed">
                {option.replace(/^[A-E]\)\s*/, '')}
              </div>
              {renderIcon(index)}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Explanation */}
      {showFeedback && evidence && (
        <Card className={cn(
          "border-2",
          selectedAnswer === correctIndex 
            ? "border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800" 
            : "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800"
        )}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Lightbulb className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5",
                selectedAnswer === correctIndex ? "text-green-600" : "text-blue-600"
              )} />
              <div>
                <h4 className={cn(
                  "font-semibold text-sm mb-2",
                  selectedAnswer === correctIndex ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"
                )}>
                  {selectedAnswer === correctIndex ? "Por que está certa?" : "Entenda a resposta:"}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{evidence}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};