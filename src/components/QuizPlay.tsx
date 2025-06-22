
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "@/hooks/useQuiz";

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
      // Finalizar quiz
      const finalResult = {
        totalQuestions: quiz.questoes.length,
        correctAnswers: score,
        accuracy: Math.round((score / quiz.questoes.length) * 100)
      };
      setGameFinished(true);
      onComplete(finalResult);
    } else {
      // Próxima pergunta
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="py-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Quiz Concluído!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                Você acertou <span className="font-bold text-green-600">{score}</span> de {quiz.questoes.length} questões
              </p>
              <p className="text-gray-600">
                Aproveitamento: {Math.round((score / quiz.questoes.length) * 100)}%
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                🔄 Tentar Novamente
              </Button>
              <Button 
                onClick={() => navigate('/my-summaries')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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

  const alternativeLabels = ['A', 'B', 'C', 'D', 'E'];
  const alternativeColors = [
    'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100',
    'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
    'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100',
    'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100',
    'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={() => navigate('/my-summaries')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="text-sm font-medium text-gray-600">
              {currentIndex + 1} de {quiz.questoes.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quiz.questoes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Questão {currentIndex + 1}
              </h2>
              <p className="text-gray-800 text-base leading-relaxed">
                {currentQuestion.pergunta}
              </p>
            </div>

            {/* Alternatives */}
            <div className="space-y-3 mb-6">
              {currentQuestion.alternativas.map((alternativa: string, index: number) => {
                let buttonClass = `w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${alternativeColors[index]}`;
                
                if (showResult) {
                  if (index === currentQuestion.correta) {
                    buttonClass = 'w-full p-4 text-left rounded-xl border-2 bg-green-100 border-green-500 text-green-800';
                  } else if (index === selectedAnswer && !isCorrect) {
                    buttonClass = 'w-full p-4 text-left rounded-xl border-2 bg-red-100 border-red-500 text-red-800';
                  } else {
                    buttonClass = 'w-full p-4 text-left rounded-xl border-2 bg-gray-100 border-gray-300 text-gray-600';
                  }
                } else if (selectedAnswer === index) {
                  buttonClass += ' ring-2 ring-purple-500 scale-[1.02]';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-sm">
                        {alternativeLabels[index]}
                      </div>
                      <span className="flex-1">{alternativa}</span>
                      {showResult && index === currentQuestion.correta && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {showResult && index === selectedAnswer && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showResult && (
              <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2`}>
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? '🎉 Correto!' : '💡 Resposta Incorreta'}
                    </h4>
                    {!isCorrect && (
                      <p className="text-red-700 mb-2">
                        <strong>Resposta correta:</strong> {alternativeLabels[currentQuestion.correta]} - {currentQuestion.alternativas[currentQuestion.correta]}
                      </p>
                    )}
                    {currentQuestion.explicacao && (
                      <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        <strong>Explicação:</strong> {currentQuestion.explicacao}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
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
