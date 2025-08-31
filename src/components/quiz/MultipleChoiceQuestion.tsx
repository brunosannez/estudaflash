import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  question: string;
  alternatives: string[];
  selectedAnswer: number | null;
  onAnswerSelect: (answer: number) => void;
  showResult: boolean;
  correctAnswer: number;
}

const MultipleChoiceQuestion = ({
  question,
  alternatives,
  selectedAnswer,
  onAnswerSelect,
  showResult,
  correctAnswer
}: MultipleChoiceQuestionProps) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];

  const getButtonVariant = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index ? 'default' : 'outline';
    }
    
    if (index === correctAnswer) {
      return 'default'; // Correct answer
    } else if (selectedAnswer === index && index !== correctAnswer) {
      return 'destructive'; // Wrong selected answer
    }
    return 'outline';
  };

  const getButtonClassName = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'hover:border-blue-300';
    }
    
    if (index === correctAnswer) {
      return 'border-green-500 bg-green-50 text-green-700';
    } else if (selectedAnswer === index && index !== correctAnswer) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    return 'opacity-50';
  };

  const renderIcon = (index: number) => {
    if (!showResult) return null;
    
    if (index === correctAnswer) {
      return <CheckCircle className="h-5 w-5 text-green-600 ml-2" />;
    } else if (selectedAnswer === index && index !== correctAnswer) {
      return <XCircle className="h-5 w-5 text-red-600 ml-2" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
          {question}
        </h3>
      </div>

      {/* Alternatives */}
      <div className="space-y-3">
        {alternatives.map((alternative, index) => (
          <Button
            key={index}
            variant={getButtonVariant(index)}
            className={`w-full text-left justify-start p-4 h-auto ${getButtonClassName(index)}`}
            onClick={() => !showResult && onAnswerSelect(index)}
            disabled={showResult}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-start">
                <span className="font-bold mr-3 text-sm">
                  {letters[index]})
                </span>
                <span className="text-sm leading-relaxed flex-1">
                  {alternative}
                </span>
              </div>
              {renderIcon(index)}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;