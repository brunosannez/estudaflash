
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';

const Quiz = () => {
  const { resumoId } = useParams<{ resumoId: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const {
    quizzes,
    loading,
    fetchQuizzes,
    generateQuiz
  } = useQuiz(resumoId || '');

  // Timer effect
  useEffect(() => {
    if (quizzes.length > 0 && !isQuizComplete) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizzes, isQuizComplete]);

  // Generate quiz on component mount
  useEffect(() => {
    if (resumoId && quizzes.length === 0 && !loading) {
      const loadQuizzes = async () => {
        try {
          const existingQuizzes = await fetchQuizzes();
          if (!existingQuizzes || existingQuizzes.length === 0) {
            await generateQuiz("Conteúdo do resumo não disponível diretamente");
          }
        } catch (error) {
          console.error('Erro ao carregar quiz:', error);
          toast.error('Erro ao carregar quiz');
        }
      };
      loadQuizzes();
    }
  }, [resumoId, quizzes.length, loading, fetchQuizzes, generateQuiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = quizzes[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correta;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setIsQuizComplete(true);
    toast.success('Quiz concluído com sucesso!');
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setTimeElapsed(0);
    setIsQuizComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Gerando quiz...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (quizzes.length === 0) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Erro ao carregar quiz</h2>
              <p className="text-gray-600 mb-4">
                Não foi possível gerar o quiz para este resumo.
              </p>
              <Button onClick={() => navigate('/my-summaries')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((score / quizzes.length) * 100);
    const passed = percentage >= 70;

    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {passed ? (
                  <CheckCircle className="h-16 w-16 text-green-500" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {passed ? 'Parabéns!' : 'Continue estudando!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Acertos</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{percentage}%</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRestartQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refazer Quiz
                </Button>
                <Button onClick={() => navigate('/quiz-history')}>
                  Ver Histórico
                </Button>
                <Button onClick={() => navigate('/my-summaries')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Resumos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const currentQuestion = quizzes[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizzes.length) * 100;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/my-summaries')} 
                  variant="ghost" 
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>Quiz - Questão {currentQuestionIndex + 1} de {quizzes.length}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(timeElapsed)}
                    </span>
                    <span>Pontuação: {score}/{currentQuestionIndex + (showExplanation ? 1 : 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.pergunta}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.alternativas.map((alternativa: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correta;
              const showResult = showExplanation;
              
              let buttonVariant: "default" | "outline" | "secondary" = "outline";
              let className = "";
              
              if (showResult) {
                if (isCorrect) {
                  buttonVariant = "default";
                  className = "bg-green-500 hover:bg-green-600 text-white border-green-500";
                } else if (isSelected && !isCorrect) {
                  buttonVariant = "secondary";
                  className = "bg-red-500 hover:bg-red-600 text-white border-red-500";
                }
              } else if (isSelected) {
                buttonVariant = "default";
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  variant={buttonVariant}
                  className={`w-full text-left justify-start p-4 h-auto whitespace-normal ${className}`}
                  disabled={showExplanation}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)})</span>
                  {alternativa}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Explanation */}
        {showExplanation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedAnswer === currentQuestion.correta ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {selectedAnswer === currentQuestion.correta ? 'Correto!' : 'Incorreto'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{currentQuestion.explicacao}</p>
              <div className="flex justify-end">
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex < quizzes.length - 1 ? 'Próxima Questão' : 'Finalizar Quiz'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        {!showExplanation && (
          <div className="flex justify-center">
            <Button 
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              size="lg"
            >
              Confirmar Resposta
            </Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Quiz;
