
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/hooks/useQuiz";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizAlternatives from "@/components/quiz/QuizAlternatives";
import QuizFeedback from "@/components/quiz/QuizFeedback";
import QuizResultScreen from "@/components/quiz/QuizResultScreen";

interface QuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onComplete: (result: any) => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const navigate = useNavigate();
  const { enviarResposta } = useQuiz(quiz.resumo_id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQuestion = quiz.questoes[currentIndex];
  const isLastQuestion = currentIndex === quiz.questoes.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleConfirmAnswer = async () => {
    if (selectedAnswer === null) return;

    const result = await enviarResposta(currentQuestion.id, selectedAnswer);
    setIsCorrect(result.acertou);
    setShowResult(true);
    
    if (result.acertou) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const finalResult = {
        totalQuestions: quiz.questoes.length,
        correctAnswers: score,
        accuracy: Math.round((score / quiz.questoes.length) * 100)
      };
      setGameFinished(true);
      onComplete(finalResult);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/my-summaries');
  };

  if (gameFinished) {
    return (
      <QuizResultScreen 
        score={score}
        totalQuestions={quiz.questoes.length}
        onRestart={handleRestart}
      />
    );
  }

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
          totalQuestions={quiz.questoes.length}
          onBack={handleBack}
        />

        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <QuizQuestion 
              question={currentQuestion.pergunta}
              currentQuestionIndex={currentIndex}
              totalQuestions={quiz.questoes.length}
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
                isCorrect={isCorrect}
                explanation={currentQuestion.explicacao}
                correctAnswer={currentQuestion.correta}
                alternatives={currentQuestion.alternativas}
              />
            )}

            <div className="flex justify-end">
              <Button 
                onClick={showResult ? handleNextQuestion : handleConfirmAnswer}
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

export default QuizPlay;
