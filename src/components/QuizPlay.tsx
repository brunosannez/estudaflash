
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizHeader from "./quiz/QuizHeader";
import QuizQuestion from "./quiz/QuizQuestion";
import QuizAlternatives from "./quiz/QuizAlternatives";
import QuizFeedback from "./quiz/QuizFeedback";
import QuizCelebration from "./quiz/QuizCelebration";
import QuizResult from "./QuizResult";
import { useQuizGame } from "@/hooks/useQuizGame";

interface QuizPlayProps {
  quiz: any;
  onComplete: (sessionResult: any) => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswer,
    showResult,
    currentXP,
    streakCount,
    showCelebration,
    currentExplanation,
    sessionResult,
    stats,
    handleAnswerSelect,
    handleNextQuestion,
    loadQuestions,
    gameState
  } = useQuizGame(quiz.resumo_id);

  // Carregar as perguntas quando o componente montar
  useEffect(() => {
    loadQuestions();
  }, []);

  // Quando o quiz é completado, chamar onComplete
  useEffect(() => {
    if (sessionResult) {
      onComplete(sessionResult);
    }
  }, [sessionResult, onComplete]);

  const isLastQuestion = currentQuestionIndex === quiz.questoes.length - 1;

  // Se temos resultado da sessão, mostrar tela de resultado
  if (sessionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
        <div className="max-w-xl mx-auto pt-8">
          <QuizResult 
            sessionResult={sessionResult}
            onRestart={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Se não temos perguntas carregadas ainda
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando quiz...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Quiz Debug Info:', {
    currentQuestionIndex,
    totalQuestions: gameState.questions.length,
    isLastQuestion,
    showResult
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 relative overflow-hidden">
      <QuizCelebration show={showCelebration} />

      <div className="max-w-2xl mx-auto">
        <QuizHeader 
          quizTitle={`Quiz - ${gameState.questions.length} perguntas`}
          currentXP={currentXP}
          streakCount={streakCount}
          stats={stats}
        />

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <QuizQuestion 
              question={currentQuestion.pergunta}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={gameState.questions.length}
            />

            <QuizAlternatives 
              alternatives={currentQuestion.alternativas}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.correta}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
            />

            {showResult && (
              <QuizFeedback 
                isCorrect={selectedAnswer === currentQuestion.correta}
                streakCount={streakCount}
                explanation={currentExplanation}
                correctAnswer={currentQuestion.correta}
                alternatives={currentQuestion.alternativas}
              />
            )}

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleNextQuestion} 
                disabled={selectedAnswer === null && !showResult}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-fredoka text-sm lg:text-base"
                size="lg"
              >
                {showResult ? 
                  (currentQuestionIndex === gameState.questions.length - 1 ? '🏆 Concluir Quiz' : '▶️ Próxima Pergunta') 
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

export default QuizPlay;
