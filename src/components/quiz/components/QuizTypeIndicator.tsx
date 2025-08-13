import React from 'react';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckSquare } from 'lucide-react';

interface QuizTypeIndicatorProps {
  questionType?: string;
  questionNumber: number;
  totalQuestions: number;
}

const QuizTypeIndicator = ({ 
  questionType = 'multipla_escolha', 
  questionNumber, 
  totalQuestions 
}: QuizTypeIndicatorProps) => {
  const isTrueFalse = questionType === 'verdadeiro_falso';
  
  return (
    <div className="flex items-center justify-center space-x-3 mb-4 md:mb-6">
      <Badge 
        variant="outline" 
        className={`text-sm md:text-base px-3 md:px-4 py-2 ${
          isTrueFalse 
            ? 'bg-info/10 text-info border-info/30' 
            : 'bg-primary/10 text-primary border-primary/30'
        }`}
      >
        {isTrueFalse ? (
          <>
            <CheckSquare className="h-4 w-4 mr-2" />
            Verdadeiro ou Falso
          </>
        ) : (
          <>
            <HelpCircle className="h-4 w-4 mr-2" />
            Múltipla Escolha
          </>
        )}
      </Badge>
      
      <Badge variant="secondary" className="text-sm md:text-base px-3 md:px-4 py-2">
        {questionNumber} de {totalQuestions}
      </Badge>
    </div>
  );
};

export default QuizTypeIndicator;