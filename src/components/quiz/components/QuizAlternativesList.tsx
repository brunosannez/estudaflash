
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizAlternativesListProps {
  alternatives: string[];
  selectedAnswer: number | null;
  showResult: boolean;
  correctAnswer: number;
  isCorrect: boolean;
  onAnswerSelect: (index: number) => void;
  questionType?: string;
}

const QuizAlternativesList = ({ 
  alternatives, 
  selectedAnswer, 
  showResult, 
  correctAnswer, 
  isCorrect,
  onAnswerSelect,
  questionType = 'multipla_escolha'
}: QuizAlternativesListProps) => {
  const isTrueFalse = questionType === 'verdadeiro_falso';
  
  return (
    <div className={`${isTrueFalse ? 'grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4' : 'space-y-3 md:space-y-4'} mb-6 md:mb-8`}>
      {alternatives?.map((alternativa: string, index: number) => {
        let buttonClass = `w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 font-medium text-sm md:text-base min-h-[60px] md:min-h-[70px] flex items-center justify-center ${isTrueFalse ? 'text-center' : ''} `;
        
        if (showResult) {
          if (index === correctAnswer) {
            buttonClass += "bg-success/10 border-success text-success-foreground";
          } else if (index === selectedAnswer && !isCorrect) {
            buttonClass += "bg-destructive/10 border-destructive text-destructive-foreground";
          } else {
            buttonClass += "bg-muted border-border text-muted-foreground";
          }
        } else if (selectedAnswer === index) {
          buttonClass += "bg-primary/10 border-primary text-primary-foreground scale-[1.02] shadow-lg";
        } else {
          buttonClass += "bg-card border-border text-card-foreground hover:bg-primary/5 hover:border-primary/30 hover:shadow-md active:scale-[0.98]";
        }

        return (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className={`flex items-center ${isTrueFalse ? 'justify-center' : 'space-x-3'} w-full`}>
              {!isTrueFalse && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background shadow-md flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </div>
              )}
              <span className={`flex-1 ${isTrueFalse ? 'text-center text-lg md:text-xl font-semibold' : 'text-left'}`}>
                {isTrueFalse ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">{index === 0 ? '✓' : '✗'}</span>
                    <span>{alternativa}</span>
                  </div>
                ) : alternativa}
              </span>
              {showResult && index === correctAnswer && (
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              )}
              {showResult && index === selectedAnswer && !isCorrect && (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuizAlternativesList;
