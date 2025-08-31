import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TrueFalseQuestionProps {
  question: string;
  statements: string[];
  selectedAnswers: boolean[] | number | null;
  onAnswerSelect: (answers: boolean[] | number) => void;
  showResult: boolean;
  correctAnswers: boolean[] | number;
  // New props for sequential V/F format
  alternatives?: string[];
  isSequential?: boolean;
  context?: string;
}

const TrueFalseQuestion = ({
  question,
  statements,
  selectedAnswers,
  onAnswerSelect,
  showResult,
  correctAnswers,
  alternatives,
  isSequential = false,
  context
}: TrueFalseQuestionProps) => {
  
  const handleStatementToggle = (index: number, value: boolean) => {
    if (showResult) return;
    
    if (isSequential) {
      // For sequential format, we don't toggle individual statements
      return;
    }
    
    const currentAnswers = Array.isArray(selectedAnswers) ? selectedAnswers : [];
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value;
    onAnswerSelect(newAnswers);
  };

  const handleSequentialSelect = (alternativeIndex: number) => {
    if (showResult) return;
    onAnswerSelect(alternativeIndex);
  };

  const getButtonStyle = (index: number, isTrue?: boolean) => {
    if (isSequential) {
      // Sequential format: treat as multiple choice
      const userAnswer = selectedAnswers as number;
      const correctAnswer = correctAnswers as number;
      
      if (!showResult) {
        return userAnswer === index 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : 'hover:border-blue-300';
      }
      
      if (index === correctAnswer) {
        return 'border-green-500 bg-green-50 text-green-700';
      } else if (userAnswer === index && index !== correctAnswer) {
        return 'border-red-500 bg-red-50 text-red-700';
      }
      return 'opacity-50';
    }
    
    // Traditional individual V/F format
    const userAnswers = selectedAnswers as boolean[];
    const correctAnswersArray = correctAnswers as boolean[];
    
    if (!userAnswers || !correctAnswersArray) return 'border-gray-300 hover:border-gray-400';
    
    const userAnswer = userAnswers[index];
    const correctAnswer = correctAnswersArray[index];
    
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
      return 'border-green-500 bg-green-50 text-green-700';
    } else if (userAnswer === isTrue) {
      return 'border-red-500 bg-red-50 text-red-700';
    }
    return 'border-gray-200 opacity-50';
  };

  const renderIcon = (index: number, isTrue?: boolean) => {
    if (!showResult) return null;
    
    if (isSequential) {
      const userAnswer = selectedAnswers as number;
      const correctAnswer = correctAnswers as number;
      
      if (index === correctAnswer) {
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      } else if (userAnswer === index && index !== correctAnswer) {
        return <XCircle className="h-4 w-4 text-red-600" />;
      }
      return null;
    }
    
    const correctAnswersArray = correctAnswers as boolean[];
    const userAnswers = selectedAnswers as boolean[];
    
    if (!correctAnswersArray || !userAnswers) return null;
    
    const correctAnswer = correctAnswersArray[index];
    const userAnswer = userAnswers[index];
    
    if (correctAnswer === isTrue) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (userAnswer === isTrue) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const allAnswered = isSequential 
    ? selectedAnswers !== null && selectedAnswers !== undefined
    : Array.isArray(selectedAnswers) && selectedAnswers.length === statements.length && 
      selectedAnswers.every(answer => answer !== undefined);

  // Sequential V/F format (A-E options)
  if (isSequential && alternatives) {
    return (
      <div className="space-y-4">
        {/* Context */}
        {context && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">{context}</p>
          </div>
        )}

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 leading-relaxed mb-4">
            {question}
          </h3>
        </div>

        {/* Statements */}
        <div className="mb-6">
          <div className="space-y-3">
            {statements.map((statement, index) => (
              <div key={index} className="flex items-start">
                <span className="text-sm font-medium text-gray-700 mr-3 mt-1">
                  {['I.', 'II.', 'III.', 'IV.'][index]}
                </span>
                <span className="text-sm text-gray-700 flex-1">
                  {statement}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sequential alternatives (A-E) */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Marque a sequência CORRETA de Verdadeiro (V) e Falso (F):
          </p>
          {alternatives.map((alternative, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-full text-left justify-start p-4 h-auto ${getButtonStyle(index)}`}
              onClick={() => handleSequentialSelect(index)}
              disabled={showResult}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm leading-relaxed">
                  {alternative}
                </span>
                {renderIcon(index)}
              </div>
            </Button>
          ))}
        </div>

        {/* Progress indicator */}
        {!showResult && !allAnswered && (
          <div className="text-center">
            <p className="text-xs text-yellow-600 mt-1">
              Selecione uma das alternativas para continuar
            </p>
          </div>
        )}
      </div>
    );
  }

  // Traditional individual V/F format
  return (
    <div className="space-y-4">
      {/* Context */}
      {context && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400">
          <p className="text-sm text-blue-800">{context}</p>
        </div>
      )}

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
            {Array.isArray(selectedAnswers) ? selectedAnswers.filter(a => a !== undefined).length : 0} de {statements.length} respondidas
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