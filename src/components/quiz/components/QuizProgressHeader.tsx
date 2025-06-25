
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QuizProgressHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  questionsCompleted: number;
  correctAnswers: number;
  onExit: () => void;
}

const QuizProgressHeader = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  questionsCompleted,
  correctAnswers,
  onExit 
}: QuizProgressHeaderProps) => {
  const progressPercentage = (questionsCompleted / totalQuestions) * 100;

  return (
    <div className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-sm z-10 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={onExit}
          className="text-gray-600 hover:text-gray-800 order-2 sm:order-1"
          size="sm"
        >
          <X className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
        
        <div className="text-center flex-1 order-1 sm:order-2">
          <div className="text-sm text-gray-600 mb-2">
            Questão {currentQuestionIndex + 1} de {totalQuestions}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {questionsCompleted} de {totalQuestions} questões completadas
          </div>
        </div>

        <div className="text-center order-3 sm:order-3">
          <div className="text-sm text-gray-600">Pontuação</div>
          <div className="text-lg font-bold text-purple-600">
            {correctAnswers}/{totalQuestions}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizProgressHeader;
