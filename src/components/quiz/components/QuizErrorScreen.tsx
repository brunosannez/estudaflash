
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizErrorScreenProps {
  error: string;
  onRetry?: () => void;
  onBack?: () => void;
}

const QuizErrorScreen = ({ error, onRetry, onBack }: QuizErrorScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-xl font-bold mb-2 text-gray-800">Erro no Quiz</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex flex-col gap-2">
          {onRetry && (
            <Button onClick={onRetry}>
              Tentar Novamente
            </Button>
          )}
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Voltar ao Histórico
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizErrorScreen;
