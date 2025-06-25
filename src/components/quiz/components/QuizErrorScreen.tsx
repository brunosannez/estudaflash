
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuizErrorScreenProps {
  error: string;
}

const QuizErrorScreen = ({ error }: QuizErrorScreenProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Erro no Quiz</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/quiz-history')}>
          Voltar ao Histórico
        </Button>
      </div>
    </div>
  );
};

export default QuizErrorScreen;
