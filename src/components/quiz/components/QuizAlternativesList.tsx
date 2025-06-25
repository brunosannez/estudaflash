
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizAlternativesListProps {
  alternatives: string[];
  selectedAnswer: number | null;
  showResult: boolean;
  correctAnswer: number;
  isCorrect: boolean;
  onAnswerSelect: (index: number) => void;
}

const QuizAlternativesList = ({ 
  alternatives, 
  selectedAnswer, 
  showResult, 
  correctAnswer, 
  isCorrect,
  onAnswerSelect 
}: QuizAlternativesListProps) => {
  return (
    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
      {alternatives?.map((alternativa: string, index: number) => {
        let buttonClass = "w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 font-medium text-sm md:text-base min-h-[60px] md:min-h-[70px] flex items-center ";
        
        if (showResult) {
          if (index === correctAnswer) {
            buttonClass += "bg-green-100 border-green-500 text-green-800";
          } else if (index === selectedAnswer && !isCorrect) {
            buttonClass += "bg-red-100 border-red-500 text-red-800";
          } else {
            buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
          }
        } else if (selectedAnswer === index) {
          buttonClass += "bg-purple-100 border-purple-500 text-purple-800 scale-[1.02] shadow-lg";
        } else {
          buttonClass += "bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md active:scale-[0.98]";
        }

        return (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="flex-1 text-left">{alternativa}</span>
              {showResult && index === correctAnswer && (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
              {showResult && index === selectedAnswer && !isCorrect && (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuizAlternativesList;
