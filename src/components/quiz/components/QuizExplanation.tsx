
import React from 'react';

interface QuizExplanationProps {
  explanation: string;
  showResult: boolean;
}

const QuizExplanation = ({ explanation, showResult }: QuizExplanationProps) => {
  if (!showResult || !explanation) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 md:p-6 rounded-lg mb-6 md:mb-8">
      <h3 className="font-bold text-blue-800 mb-2 text-sm md:text-base">Explicação:</h3>
      <p className="text-blue-700 leading-relaxed text-sm md:text-base">
        {explanation}
      </p>
    </div>
  );
};

export default QuizExplanation;
