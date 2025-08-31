import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TrueFalseQuestionProps {
  question: string;
  statements: string[];
  selectedAnswers: boolean[];
  onAnswerSelect: (answers: boolean[]) => void;
  showResult: boolean;
  correctAnswers: boolean[];
}

const TrueFalseQuestion = ({
  question,
  statements,
  selectedAnswers,
  onAnswerSelect,
  showResult,
  correctAnswers
}: TrueFalseQuestionProps) => {
  
  const handleStatementToggle = (index: number, value: boolean) => {
    if (showResult) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[index] = value;
    onAnswerSelect(newAnswers);
  };

  const getButtonStyle = (index: number, isTrue: boolean) => {
    const userAnswer = selectedAnswers[index];
    const correctAnswer = correctAnswers[index];
    
    if (!showResult) {
      if (userAnswer === isTrue) {
        return isTrue 
          ? 'border-green-500 bg-green-50 text-green-700' 
          : 'border-red-500 bg-red-50 text-red-700';
      }
      return 'border-gray-300 hover:border-gray-400';
    }
    
    // Show result mode
    if (correctAnswer === isTrue) {
      return 'border-green-500 bg-green-50 text-green-700'; // Correct answer
    } else if (userAnswer === isTrue) {
      return 'border-red-500 bg-red-50 text-red-700'; // Wrong selected answer
    }
    return 'border-gray-200 opacity-50';
  };

  const renderIcon = (index: number, isTrue: boolean) => {
    if (!showResult) return null;
    
    const correctAnswer = correctAnswers[index];
    const userAnswer = selectedAnswers[index];
    
    if (correctAnswer === isTrue) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (userAnswer === isTrue) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const allAnswered = selectedAnswers.length === statements.length && 
                     selectedAnswers.every(answer => answer !== undefined);

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed mb-2">
          {question}
        </h3>
        <p className="text-sm text-gray-600">
          Analise cada afirmação e marque se é Verdadeira ou Falsa:
        </p>
      </div>

      {/* Statements */}
      <div className="space-y-4">
        {statements.map((statement, index) => (
          <Card key={index} className="border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {index + 1}. {statement}
                </span>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${getButtonStyle(index, true)}`}
                  onClick={() => handleStatementToggle(index, true)}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">Verdadeiro</span>
                    {renderIcon(index, true)}
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex-1 ${getButtonStyle(index, false)}`}
                  onClick={() => handleStatementToggle(index, false)}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-medium">Falso</span>
                    {renderIcon(index, false)}
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress indicator */}
      {!showResult && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {selectedAnswers.filter(a => a !== undefined).length} de {statements.length} respondidas
          </p>
          {!allAnswered && (
            <p className="text-xs text-yellow-600 mt-1">
              Responda todas as afirmações para continuar
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrueFalseQuestion;