
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizHeader from "./quiz/QuizHeader";
import QuizQuestion from "./quiz/QuizQuestion";
import QuizAlternatives from "./quiz/QuizAlternatives";
import QuizFeedback from "./quiz/QuizFeedback";
import QuizCelebration from "./quiz/QuizCelebration";
import { useQuizGame } from "@/hooks/useQuizGame";

interface QuizPlayProps {
  quiz: any;
  onComplete: () => void;
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
    stats,
    handleAnswerSelect,
    handleNextQuestion
  } = useQuizGame(quiz, onComplete);

  const isLastQuestion = currentQuestionIndex === quiz.questoes.length - 1;

  console.log('🎯 Quiz Debug Info:', {
    currentQuestionIndex,
    totalQuestions: quiz.questoes.length,
    isLastQuestion,
    showResult
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 relative overflow-hidden">
      <QuizCelebration show={showCelebration} />

      <div className="max-w-2xl mx-auto">
        <QuizHeader 
          quizTitle={quiz.titulo}
          currentXP={currentXP}
          streakCount={streakCount}
          stats={stats}
        />

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <QuizQuestion 
              question={currentQuestion.pergunta}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={quiz.questoes.length}
            />

            <QuizAlternatives 
              alternatives={currentQuestion.alternativas}
              selectedAnswer={selectedAnswer}
              correctAnswer={currentQuestion.resposta_correta}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
            />

            {showResult && (
              <QuizFeedback 
                isCorrect={selectedAnswer === currentQuestion.resposta_correta}
                streakCount={streakCount}
                explanation={currentExplanation}
                correctAnswer={currentQuestion.resposta_correta}
                alternatives={currentQuestion.alternativas}
              />
            )}

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleNextQuestion} 
                disabled={!showResult}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-fredoka text-sm lg:text-base"
                size="lg"
              >
                {isLastQuestion ? '🏆 Concluir Quiz' : '▶️ Próxima Pergunta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPlay;
