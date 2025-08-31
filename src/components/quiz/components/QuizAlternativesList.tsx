
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
  questionType = 'objetiva'
}: QuizAlternativesListProps) => {
  const isTrueFalse = questionType === 'verdadeiro_falso' || questionType === 'verdadeiro_falso_simples';
  const isCombinations = questionType === 'verdadeiro_falso_combinacoes';
  
  return (
    <div className={`${isTrueFalse ? 'grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4' : 'space-y-3 md:space-y-4'} mb-6 md:mb-8`}>
      {alternatives?.map((alternativa: string, index: number) => {
        let buttonClass = `w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 font-medium text-sm md:text-base min-h-[60px] md:min-h-[70px] flex items-center ${isTrueFalse ? 'justify-center text-center' : 'justify-start'} `;
        
        if (showResult) {
          if (index === correctAnswer) {
            buttonClass += "bg-green-500 border-green-600 text-white font-semibold shadow-lg";
          } else if (index === selectedAnswer && !isCorrect) {
            buttonClass += "bg-red-500 border-red-600 text-white font-semibold shadow-lg";
          } else {
            buttonClass += "bg-gray-100 border-gray-300 text-gray-500";
          }
        } else if (selectedAnswer === index) {
          buttonClass += "bg-blue-50 border-blue-500 text-blue-700 scale-[1.02] shadow-lg font-medium";
        } else {
          buttonClass += "bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md active:scale-[0.98]";
        }

        return (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={buttonClass}
          >
            <div className={`flex items-center ${isTrueFalse ? 'justify-center' : 'space-x-3'} w-full`}>
              {!isTrueFalse && !isCombinations && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background shadow-md flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </div>
              )}
              
              {isCombinations && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background shadow-md flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </div>
              )}
              
              <span className={`flex-1 ${isTrueFalse && !isCombinations ? 'text-center text-lg md:text-xl font-semibold' : 'text-left'}`}>
                {isTrueFalse && !isCombinations ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">{index === 0 ? '✓' : '✗'}</span>
                    <span>{alternativa}</span>
                  </div>
                ) : isCombinations ? (
                  <div className="text-center font-mono font-bold text-lg">
                    {alternativa}
                  </div>
                ) : alternativa}
              </span>
              
              {showResult && index === correctAnswer && (
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                </div>
              )}
              {showResult && index === selectedAnswer && !isCorrect && (
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuizAlternativesList;
