
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizAlternatives from '@/components/quiz/QuizAlternatives';
import QuizFeedback from '@/components/quiz/QuizFeedback';

interface QuizGameplayProps {
  currentQuestion: any;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  showResult: boolean;
  isCorrect: boolean;
  isLastQuestion: boolean;
  onAnswerSelect: (index: number) => void;
  onConfirmAnswer: () => Promise<void>;
  onNextQuestion: () => Promise<void>;
  onBack: () => void;
}

const QuizGameplay = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  showResult,
  isCorrect,
  isLastQuestion,
  onAnswerSelect,
  onConfirmAnswer,
  onNextQuestion,
  onBack
}: QuizGameplayProps) => {
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando questão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <QuizHeader 
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onBack={onBack}
        />

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <QuizQuestion 
              question={currentQuestion.pergunta}
              currentQuestionIndex={currentIndex}
              totalQuestions={totalQuestions}
            />

            <QuizAlternatives 
              alternatives={currentQuestion.alternativas}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.correta}
              showResult={showResult}
              onAnswerSelect={onAnswerSelect}
            />

            {showResult && (
              <QuizFeedback 
                isCorrect={isCorrect}
                explanation={currentQuestion.explicacao}
                correctAnswer={currentQuestion.correta}
                alternatives={currentQuestion.alternativas}
              />
            )}

            <div className="flex justify-end">
              <Button 
                onClick={showResult ? onNextQuestion : onConfirmAnswer}
                disabled={!showResult && selectedAnswer === null}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-xl"
              >
                {showResult ? 
                  (isLastQuestion ? '🏆 Finalizar Quiz' : '▶️ Próxima Pergunta') 
                  : '✅ Confirmar Resposta'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizGameplay;
