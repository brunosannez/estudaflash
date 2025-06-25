
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizActionButtonProps {
  showResult: boolean;
  selectedAnswer: number | null;
  isLastQuestion: boolean;
  onConfirmAnswer: () => void;
  onNextQuestion: () => void;
}

const QuizActionButton = ({ 
  showResult, 
  selectedAnswer, 
  isLastQuestion, 
  onConfirmAnswer, 
  onNextQuestion 
}: QuizActionButtonProps) => {
  if (!showResult) {
    return (
      <Button
        onClick={onConfirmAnswer}
        disabled={selectedAnswer === null}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg w-full md:w-auto min-h-[50px] md:min-h-[60px]"
      >
        Confirmar Resposta
      </Button>
    );
  }

  return (
    <Button
      onClick={onNextQuestion}
      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg w-full md:w-auto min-h-[50px] md:min-h-[60px]"
    >
      {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
    </Button>
  );
};

export default QuizActionButton;
