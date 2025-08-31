
import React from 'react';

interface QuizQuestionDisplayProps {
  question: string;
  context?: string;
  statements?: string[];
  questionType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const QuizQuestionDisplay = ({ 
  question, 
  context, 
  statements, 
  questionType,
  difficulty 
}: QuizQuestionDisplayProps) => {
  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getDifficultyLabel = (diff?: string) => {
    switch (diff) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'Médio';
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      {/* Difficulty indicator */}
      {difficulty && (
        <div className="flex justify-end mb-3">
          <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(difficulty)}`}>
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
      )}
      
      {/* Context */}
      {context && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-400">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed italic">
            {context}
          </p>
        </div>
      )}
      
      {/* Main question */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
        {question}
      </h2>

      {/* Statements for V/F combinations */}
      {questionType === 'verdadeiro_falso_combinacoes' && statements && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="space-y-2">
            {statements.map((statement, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="font-semibold text-blue-600 mt-1 text-sm">
                  {statement.split('.')[0]}.
                </span>
                <span className="text-gray-700 text-sm md:text-base leading-relaxed">
                  {statement.substring(statement.indexOf('.') + 1).trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestionDisplay;
