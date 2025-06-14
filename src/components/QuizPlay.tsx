import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast"
import { useGameification } from '@/hooks/useGameification';

interface QuizPlayProps {
  quiz: any;
  onComplete: () => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const navigate = useNavigate();
  const { addXP } = useGameification();

  const currentQuestion = quiz.questoes[currentQuestionIndex];

  useEffect(() => {
    if (quizCompleted) {
      onComplete();
    }
  }, [quizCompleted, onComplete]);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === currentQuestion.resposta_correta) {
      setCorrectAnswersCount(correctAnswersCount + 1);
    }

    setSelectedAnswer(null);
    setShowResult(false);

    if (currentQuestionIndex < quiz.questoes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      const correctPercentage = (correctAnswersCount / quiz.questoes.length) * 100;
      let xpAwarded = 50;

      if (correctPercentage >= 0.6) {
        xpAwarded = 100;
      } else if (correctPercentage >= 0.8) {
        xpAwarded = 150;
      }

      addXP(xpAwarded, 'quiz_complete');

      toast({
        title: "Quiz Completo!",
        description: `Você acertou ${correctAnswersCount} de ${quiz.questoes.length} questões e ganhou +${xpAwarded} XP!`,
      })

      navigate('/quiz-history');
    }
  };

  const alternativeEmojis = [
    { emoji: "🔴", letter: "A", bg: "bg-red-100", border: "border-red-300", text: "text-red-700", hover: "hover:bg-red-200" },
    { emoji: "🔵", letter: "B", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700", hover: "hover:bg-blue-200" },
    { emoji: "🟢", letter: "C", bg: "bg-green-100", border: "border-green-300", text: "text-green-700", hover: "hover:bg-green-200" },
    { emoji: "🟡", letter: "D", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700", hover: "hover:bg-yellow-200" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quiz: {quiz.titulo}
          </h1>
          <p className="text-gray-600">
            Responda as perguntas e teste seus conhecimentos!
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                Pergunta {currentQuestionIndex + 1} de {quiz.questoes.length}
              </h2>
              <p className="text-gray-600">{currentQuestion.pergunta}</p>
            </div>

            <div className="space-y-4">
              {currentQuestion.alternativas.map((alt, index) => {
                const altStyle = alternativeEmojis[index];
                const isSelected = selectedAnswer === index;
                const isCorrect = showResult && index === currentQuestion.resposta_correta;
                const isWrong = showResult && isSelected && index !== currentQuestion.resposta_correta;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-6 rounded-2xl border-3 text-left transition-all duration-300 transform hover:scale-[1.02] font-nunito font-semibold text-lg
                      ${isSelected ? `${altStyle.bg} ${altStyle.border} ${altStyle.text} scale-[1.02] shadow-lg` : 
                        showResult ? 
                          isCorrect ? 'bg-green-100 border-green-400 text-green-800 shadow-lg' :
                          isWrong ? 'bg-red-100 border-red-400 text-red-800 shadow-lg' :
                          'bg-gray-100 border-gray-300 text-gray-600' :
                        `${altStyle.bg} ${altStyle.border} ${altStyle.text} ${altStyle.hover} hover:shadow-lg`
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-fredoka text-xl font-bold
                        ${isSelected ? 'bg-white shadow-md' : 
                          showResult && isCorrect ? 'bg-green-200' :
                          showResult && isWrong ? 'bg-red-200' :
                          'bg-white/70'
                        }`}>
                        <span className="text-2xl">{altStyle.emoji}</span>
                        <span className={`ml-1 ${isSelected ? altStyle.text : 'text-gray-700'}`}>
                          {altStyle.letter}
                        </span>
                      </div>
                      <span className="flex-1">{alt}</span>
                      {showResult && isCorrect && (
                        <span className="text-2xl">✅</span>
                      )}
                      {showResult && isWrong && (
                        <span className="text-2xl">❌</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-6">
                {selectedAnswer === currentQuestion.resposta_correta ? (
                  <div className="flex items-center text-green-600 font-semibold">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Resposta Correta!
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 font-semibold">
                    <XCircle className="h-5 w-5 mr-2" />
                    Resposta Incorreta.
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button onClick={handleNextQuestion} disabled={!showResult}>
                {currentQuestionIndex === quiz.questoes.length - 1 ? 'Concluir Quiz' : 'Próxima Pergunta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPlay;
