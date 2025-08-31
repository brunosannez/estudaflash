import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import QuizFeedback from './QuizFeedback';
import { useQuizScoring } from '@/hooks/quiz/useQuizScoring';
import { QuizQuestion } from '@/types/quizGame';

interface QuizGameEngineProps {
  questions: QuizQuestion[];
  onComplete: (result: any) => void;
  onExit: () => void;
  resumoId: string;
  sessionId?: string;
}

interface GameState {
  currentQuestionIndex: number;
  selectedAnswer: number | boolean[] | null;
  showResult: boolean;
  isCorrect: boolean;
  gameFinished: boolean;
  correctAnswers: number;
  startTime: number;
  questionStartTime: number;
}

const QuizGameEngine = ({ 
  questions, 
  onComplete, 
  onExit, 
  resumoId,
  sessionId 
}: QuizGameEngineProps) => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
    gameFinished: false,
    correctAnswers: 0,
    startTime: Date.now(),
    questionStartTime: Date.now()
  });

  const { handleCorrectAnswer, handleIncorrectAnswer, finalizeSessionResult } = useQuizScoring();

  const currentQuestion = questions[gameState.currentQuestionIndex];
  const isLastQuestion = gameState.currentQuestionIndex === questions.length - 1;
  const progress = ((gameState.currentQuestionIndex + 1) / questions.length) * 100;

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: number | boolean[]) => {
    if (gameState.showResult) return;
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer
    }));
  }, [gameState.showResult]);

  // Confirm answer and show feedback
  const handleConfirmAnswer = useCallback(async () => {
    if (gameState.selectedAnswer === null || gameState.showResult) return;

    let isCorrect = false;

    // Check if answer is correct based on question type
    if (currentQuestion.question_type === 'objetiva') {
      isCorrect = gameState.selectedAnswer === currentQuestion.correta;
    } else if (currentQuestion.question_type === 'verdadeiro_falso_simples' || currentQuestion.question_type === 'verdadeiro_falso_combinacoes') {
      const userAnswers = gameState.selectedAnswer as boolean[];
      const correctAnswers = currentQuestion.statements?.map(() => currentQuestion.answer) || [];
      isCorrect = userAnswers.length === correctAnswers.length && 
                 userAnswers.every((answer, index) => answer === correctAnswers[index]);
    }

    // Award XP based on correctness
    if (isCorrect) {
      await handleCorrectAnswer();
    } else {
      await handleIncorrectAnswer();
    }

    setGameState(prev => ({
      ...prev,
      showResult: true,
      isCorrect,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0)
    }));
  }, [gameState.selectedAnswer, gameState.showResult, currentQuestion, handleCorrectAnswer, handleIncorrectAnswer]);

  // Move to next question or finish quiz
  const handleNextQuestion = useCallback(async () => {
    if (isLastQuestion) {
      // Finish the quiz
      const endTime = Date.now();
      const completionTime = Math.round((endTime - gameState.startTime) / 1000);
      const accuracy = Math.round((gameState.correctAnswers / questions.length) * 100);

      const sessionResult = {
        id: sessionId || 'temp',
        quizTitle: `Quiz - ${questions.length} questões`,
        totalQuestions: questions.length,
        correctAnswers: gameState.correctAnswers,
        accuracy,
        completionTime,
        bonusXP: 0,
        totalXP: 0,
        questions,
        userAnswers: [], // Would be tracked in a real implementation
        performance: {
          wrongAnswers: [],
          suggestions: [],
          weakTopics: []
        },
        questionsData: questions
      };

      // Finalize with bonus XP calculation
      const finalResult = await finalizeSessionResult(sessionResult);
      
      setGameState(prev => ({ ...prev, gameFinished: true }));
      onComplete(finalResult);
    } else {
      // Move to next question
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
        questionStartTime: Date.now()
      }));
    }
  }, [isLastQuestion, gameState, questions, sessionId, finalizeSessionResult, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameFinished) return;

      if (event.key === 'Enter') {
        if (!gameState.showResult && gameState.selectedAnswer !== null) {
          handleConfirmAnswer();
        } else if (gameState.showResult) {
          handleNextQuestion();
        }
      } else if (event.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleConfirmAnswer, handleNextQuestion, onExit]);

  if (gameState.gameFinished) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Quiz Concluído!</h2>
            <p className="text-gray-600 mb-6">
              Você acertou {gameState.correctAnswers} de {questions.length} questões
            </p>
            <div className="space-y-3">
              <Button onClick={onExit} className="w-full">
                Ver Histórico
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onExit} className="text-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Sair
          </Button>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1 text-yellow-500" />
              {gameState.correctAnswers}/{questions.length}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Questão {gameState.currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Question Type Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentQuestion.question_type === 'verdadeiro_falso_simples' || currentQuestion.question_type === 'verdadeiro_falso_combinacoes'
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {currentQuestion.question_type === 'verdadeiro_falso_simples' || currentQuestion.question_type === 'verdadeiro_falso_combinacoes' ? 'Verdadeiro/Falso' : 'Múltipla Escolha'}
                </span>
              </div>
            </div>

            {/* Question Content */}
            {currentQuestion.question_type === 'verdadeiro_falso_simples' || currentQuestion.question_type === 'verdadeiro_falso_combinacoes' ? (
              <TrueFalseQuestion
                question={currentQuestion.pergunta}
                statements={currentQuestion.statements || []}
                selectedAnswers={gameState.selectedAnswer as boolean[] || []}
                onAnswerSelect={handleAnswerSelect}
                showResult={gameState.showResult}
                correctAnswers={currentQuestion.statements?.map(() => currentQuestion.answer || false) || []}
              />
            ) : (
              <MultipleChoiceQuestion
                question={currentQuestion.pergunta}
                alternatives={currentQuestion.alternativas}
                selectedAnswer={gameState.selectedAnswer as number}
                onAnswerSelect={handleAnswerSelect}
                showResult={gameState.showResult}
                correctAnswer={currentQuestion.correta}
              />
            )}
          </CardContent>
        </Card>

        {/* Feedback */}
        {gameState.showResult && (
          <QuizFeedback
            isCorrect={gameState.isCorrect}
            explanation={currentQuestion.explicacao}
            correctAnswer={currentQuestion.correta}
            alternatives={currentQuestion.alternativas}
          />
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {!gameState.showResult ? (
            <Button 
              onClick={handleConfirmAnswer}
              disabled={gameState.selectedAnswer === null}
              size="lg"
              className="px-8 py-3"
            >
              Confirmar Resposta
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              size="lg"
              className="px-8 py-3"
            >
              {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGameEngine;