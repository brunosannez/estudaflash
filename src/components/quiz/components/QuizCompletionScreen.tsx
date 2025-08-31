
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizCompletionScreenProps {
  correctAnswers: number;
  totalQuestions: number;
  onComplete?: () => void;
}

const QuizCompletionScreen = ({ correctAnswers, totalQuestions, onComplete }: QuizCompletionScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto text-center">
        <div className="text-4xl md:text-6xl mb-4 md:mb-6">🎉</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Quiz Concluído!
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-6">
          Você acertou <span className="font-bold text-green-600">{correctAnswers}</span> de{' '}
          <span className="font-bold">{totalQuestions}</span> questões
        </p>
        <div className="text-base md:text-lg text-gray-500 mb-6 md:mb-8">
          Precisão: {Math.round((correctAnswers / totalQuestions) * 100)}%
        </div>
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 rounded-xl font-bold text-base md:text-lg w-full md:w-auto"
        >
          Ver Histórico de Quizzes
        </Button>
      </div>
    </div>
  );
};

export default QuizCompletionScreen;
