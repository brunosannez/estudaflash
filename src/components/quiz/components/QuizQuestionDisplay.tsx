
import React from 'react';

interface QuizQuestionDisplayProps {
  question: string;
}

const QuizQuestionDisplay = ({ question }: QuizQuestionDisplayProps) => {
  return (
    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8 leading-relaxed">
      {question}
    </h2>
  );
};

export default QuizQuestionDisplay;
