import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';
import { Trophy, Target, BookOpen, X, Pause, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameification } from '@/hooks/useGameification';
import { toast } from 'sonner';
import EnhancedQuizGameManager from '@/components/quiz/EnhancedQuizGameManager';

interface QuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  onComplete?: (result: any) => void;
}

const QuizPlay = ({ quiz, onComplete }: QuizPlayProps) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const resumeMode = searchParams.get('resume') === 'true';
  
  const [gameFinished, setGameFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [isExiting, setIsExiting] = useState(false);
  
  const { getStats } = useGameification();

  console.log('🎯 QuizPlay initialized with:', {
    resumoId: quiz.resumo_id,
    questionsCount: quiz.questoes.length,
    sessionId,
    resumeMode
  });

  const handleGameFinish = (finalScore: number) => {
    console.log('🏆 Quiz finished with score:', finalScore);
    
    const result = {
      sessionId: sessionId || 'new-session',
      correctAnswers: finalScore,
      totalQuestions: quiz.questoes.length,
      accuracy: Math.round((finalScore / quiz.questoes.length) * 100)
    };
    
    setFinalResult(result);
    setGameFinished(true);
    
    if (onComplete) {
      onComplete(result);
    }
  };

  const handleExitQuiz = async () => {
    console.log('🚪 Exiting quiz - progress saved automatically by trigger...');
    setIsExiting(true);
    
    try {
      toast.success('Progresso salvo automaticamente! Você pode continuar mais tarde.', {
        duration: 3000
      });
      
      navigate('/quiz-history');
      
    } catch (error) {
      console.error('❌ Error during quiz exit:', error);
      toast.error('Erro ao salvar progresso. Tente novamente.');
    } finally {
      setIsExiting(false);
    }
  };

  if (gameFinished && finalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className={`${designColors.cards.primary} max-w-2xl mx-auto text-center p-8`}>
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Quiz Concluído!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-700">{finalResult.correctAnswers}</div>
              <div className="text-sm text-green-600">Acertos</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-700">{finalResult.accuracy}%</div>
              <div className="text-sm text-blue-600">Precisão</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-700">{finalResult.totalQuestions}</div>
              <div className="text-sm text-purple-600">Questões</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/quiz-history')}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Ver Histórico
            </Button>
            
            <Button 
              onClick={() => navigate('/my-summaries')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Criar Novo Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EnhancedQuizGameManager
      quiz={quiz}
      sessionId={sessionId || undefined}
      resumeMode={resumeMode}
      onGameFinish={handleGameFinish}
    >
      {({
        currentIndex,
        selectedAnswer,
        showResult,
        isCorrect,
        score,
        currentQuestion,
        isLastQuestion,
        handleAnswerSelect,
        handleConfirmAnswer,
        handleNextQuestion
      }) => (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Header with progress and exit button */}
            <div className={`${designColors.cards.primary} mb-6 p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  {quiz.titulo || `Quiz - ${quiz.questoes.length} questões`}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Questão {currentIndex + 1} de {quiz.questoes.length}
                  </div>
                  <div className="text-sm font-semibold text-purple-600">
                    Score: {score}/{quiz.questoes.length}
                  </div>
                  <Button
                    onClick={handleExitQuiz}
                    disabled={isExiting}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    {isExiting ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    {isExiting ? 'Salvando...' : 'Sair'}
                  </Button>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quiz.questoes.length) * 100}%` }}
                ></div>
              </div>
              
              {/* Gamification Stats */}
              {getStats() && (
                <div className="flex justify-center gap-4 text-sm">
                  <div className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <span className="text-yellow-700 font-semibold">XP: {getStats()?.currentXp || 0}</span>
                  </div>
                  <div className="bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                    <span className="text-purple-700 font-semibold">Nível: {getStats()?.currentLevel || 1}</span>
                  </div>
                  <div className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <span className="text-green-700 font-semibold">Streak: {getStats()?.currentStreak || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Question */}
            <div className={`${designColors.cards.primary} mb-6 p-8`}>
              <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
                {currentQuestion?.pergunta}
              </h2>

              {/* Alternatives */}
              <div className="space-y-4">
                {currentQuestion?.alternativas?.map((alternativa: string, index: number) => {
                  let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ';
                  
                  if (showResult) {
                    // Show result after confirming - use the correta field directly
                    const correctIndex = currentQuestion.correta;
                    
                    if (index === correctIndex) {
                      // Correct answer always in green
                      buttonClass += 'border-green-500 bg-green-50 text-green-800 ';
                    } else if (selectedAnswer === index) {
                      // Selected answer (if incorrect) in red
                      buttonClass += 'border-red-500 bg-red-50 text-red-800 ';
                    } else {
                      // Other alternatives neutral
                      buttonClass += 'border-gray-200 bg-gray-50 text-gray-600 ';
                    }
                  } else {
                    // Before confirming
                    if (selectedAnswer === index) {
                      buttonClass += 'border-purple-500 bg-purple-50 text-purple-800 ';
                    } else {
                      buttonClass += 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 ';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-start">
                        <span className="font-semibold mr-3 text-gray-500 mt-1">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-left">{alternativa}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && currentQuestion?.explicacao && (
                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Explicação:</h3>
                  <p className="text-blue-700">{currentQuestion.explicacao}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {showResult && (
                  <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '✅ Correto! +10 XP' : '❌ Incorreto +2 XP'}
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                {!showResult ? (
                  <Button
                    onClick={handleConfirmAnswer}
                    disabled={selectedAnswer === null}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
                  >
                    Confirmar Resposta
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                  >
                    {isLastQuestion ? (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Finalizar Quiz
                      </>
                    ) : (
                      'Próxima Questão'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </EnhancedQuizGameManager>
  );
};

export default QuizPlay;
