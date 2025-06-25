
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { useSimpleQuizSession } from '@/hooks/quiz/useSimpleQuizSession';
import { useGameification } from '@/hooks/useGameification';
import { toast } from 'sonner';

interface SimplifiedQuizPlayProps {
  quiz: {
    resumo_id: string;
    questoes: any[];
    titulo?: string;
  };
  sessionId?: string;
  resumeMode?: boolean;
  onComplete: (result: any) => void;
}

const SimplifiedQuizPlay = ({ quiz, sessionId, resumeMode = false, onComplete }: SimplifiedQuizPlayProps) => {
  const navigate = useNavigate();
  const { addXP } = useGameification();
  
  const { 
    sessionId: activeSessionId,
    loading: sessionLoading,
    error: sessionError,
    currentQuestionIndex: sessionQuestionIndex,
    correctAnswers: sessionCorrectAnswers,
    createOrResumeSession,
    saveProgress,
    resetSession
  } = useSimpleQuizSession();

  // Local UI states
  const [localQuestionIndex, setLocalQuestionIndex] = useState(0);
  const [localCorrectAnswers, setLocalCorrectAnswers] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState(0); // New state for completed questions
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Memoize current question to prevent recalculation
  const currentQuestion = useMemo(() => {
    if (!quiz.questoes || quiz.questoes.length === 0) return null;
    const index = Math.min(localQuestionIndex, quiz.questoes.length - 1);
    return quiz.questoes[index];
  }, [quiz.questoes, localQuestionIndex]);

  const isLastQuestion = useMemo(() => {
    return localQuestionIndex === quiz.questoes.length - 1;
  }, [localQuestionIndex, quiz.questoes.length]);

  // Progress based on completed questions, not current question
  const progressPercentage = useMemo(() => {
    return (questionsCompleted / quiz.questoes.length) * 100;
  }, [questionsCompleted, quiz.questoes.length]);

  // Initialize session once
  useEffect(() => {
    if (!quiz.questoes || quiz.questoes.length === 0) return;
    if (activeSessionId || sessionLoading) return;

    const initSession = async () => {
      await createOrResumeSession(quiz.resumo_id, quiz.questoes, sessionId);
    };

    initSession();
  }, [quiz.resumo_id, quiz.questoes, sessionId, activeSessionId, sessionLoading, createOrResumeSession]);

  // Sync local state with session state when session loads
  useEffect(() => {
    if (activeSessionId && !sessionLoading) {
      console.log('🔄 Syncing local state with session:', { sessionQuestionIndex, sessionCorrectAnswers });
      setLocalQuestionIndex(sessionQuestionIndex);
      setLocalCorrectAnswers(sessionCorrectAnswers);
      // Set completed questions based on session progress
      setQuestionsCompleted(sessionQuestionIndex);
    }
  }, [activeSessionId, sessionLoading, sessionQuestionIndex, sessionCorrectAnswers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!gameFinished && activeSessionId) {
        resetSession();
      }
    };
  }, [gameFinished, activeSessionId, resetSession]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  }, [showResult]);

  const handleConfirmAnswer = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correctAnswer = Number(currentQuestion.correta);
    const isAnswerCorrect = selectedAnswer === correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    // Update local state
    if (isAnswerCorrect) {
      setLocalCorrectAnswers(prev => prev + 1);
    }

    // Save progress to database
    const saved = await saveProgress(localQuestionIndex, selectedAnswer, isAnswerCorrect);
    
    if (saved) {
      console.log('✅ Progress saved to database');
    }

    // Add XP
    try {
      if (isAnswerCorrect) {
        await addXP(10, 'quiz_correct');
        toast.success('🎉 Correto! +10 XP', { duration: 2000 });
      } else {
        await addXP(2, 'quiz_incorrect');
        toast('💪 Continue tentando! +2 XP', { duration: 2000 });
      }
    } catch (xpError) {
      console.error('⚠️ Error adding XP:', xpError);
    }
  }, [selectedAnswer, currentQuestion, localQuestionIndex, saveProgress, addXP]);

  const handleNextQuestion = useCallback(async () => {
    if (isLastQuestion) {
      console.log('🏆 Quiz completed, finalizing...');
      
      setGameFinished(true);
      
      const finalCorrectAnswers = isCorrect ? localCorrectAnswers + 1 : localCorrectAnswers;
      
      const result = {
        sessionId: activeSessionId,
        correctAnswers: finalCorrectAnswers,
        totalQuestions: quiz.questoes.length,
        accuracy: Math.round((finalCorrectAnswers / quiz.questoes.length) * 100)
      };
      
      onComplete(result);
      
      // Bonus XP
      try {
        const accuracy = (finalCorrectAnswers / quiz.questoes.length) * 100;
        
        if (accuracy === 100) {
          await addXP(50, 'quiz_perfect');
          toast.success('🏆 Perfeito! +50 XP de bônus!', { duration: 4000 });
        } else if (accuracy >= 80) {
          await addXP(25, 'quiz_excellent');
          toast.success('🎯 Excelente! +25 XP de bônus!', { duration: 4000 });
        } else if (accuracy >= 60) {
          await addXP(15, 'quiz_good');
          toast.success('👍 Bom trabalho! +15 XP de bônus!', { duration: 4000 });
        }
      } catch (bonusError) {
        console.error('⚠️ Error adding bonus XP:', bonusError);
      }
    } else {
      console.log('➡️ Moving to next question');
      
      // Update completed questions count ONLY when moving to next question
      setQuestionsCompleted(prev => prev + 1);
      
      setLocalQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  }, [isLastQuestion, isCorrect, localCorrectAnswers, activeSessionId, quiz.questoes.length, onComplete, addXP]);

  const handleExit = useCallback(() => {
    const confirmExit = window.confirm(
      'Tem certeza que deseja sair do quiz? Seu progresso será salvo automaticamente.'
    );
    
    if (confirmExit) {
      toast.info('Progresso salvo! Você pode continuar o quiz depois.');
      navigate('/quiz-history');
    }
  }, [navigate]);

  // Loading state
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            {resumeMode ? 'Retomando quiz...' : 'Inicializando quiz...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Erro no Quiz</h2>
          <p className="text-gray-600 mb-4">{sessionError}</p>
          <Button onClick={() => navigate('/quiz-history')}>
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  // No questions
  if (!quiz.questoes || quiz.questoes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Nenhuma questão encontrada</p>
          <Button onClick={() => navigate('/quiz-history')}>
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  // Game finished state
  if (gameFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl mx-auto text-center">
          <div className="text-4xl md:text-6xl mb-4 md:mb-6">🎉</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Quiz Concluído!
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Você acertou <span className="font-bold text-green-600">{localCorrectAnswers}</span> de{' '}
            <span className="font-bold">{quiz.questoes.length}</span> questões
          </p>
          <div className="text-base md:text-lg text-gray-500 mb-6 md:mb-8">
            Precisão: {Math.round((localCorrectAnswers / quiz.questoes.length) * 100)}%
          </div>
          <Button
            onClick={() => navigate('/quiz-history')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 rounded-xl font-bold text-base md:text-lg w-full md:w-auto"
          >
            Ver Histórico de Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // No current question
  if (!currentQuestion) {
    console.error('❌ Current question not found at index:', localQuestionIndex);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando questão...</p>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* Mobile-first responsive header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-sm z-10 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="text-gray-600 hover:text-gray-800 order-2 sm:order-1"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
          
          <div className="text-center flex-1 order-1 sm:order-2">
            <div className="text-sm text-gray-600 mb-2">
              Questão {localQuestionIndex + 1} de {quiz.questoes.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {questionsCompleted} de {quiz.questoes.length} questões respondidas
            </div>
          </div>

          <div className="text-center order-3 sm:order-3">
            <div className="text-sm text-gray-600">Pontuação</div>
            <div className="text-lg font-bold text-purple-600">
              {localCorrectAnswers}/{quiz.questoes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8 leading-relaxed">
              {currentQuestion.pergunta}
            </h2>

            {/* Responsive alternatives */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {currentQuestion.alternativas?.map((alternativa: string, index: number) => {
                let buttonClass = "w-full p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 font-medium text-sm md:text-base min-h-[60px] md:min-h-[70px] flex items-center ";
                
                if (showResult) {
                  if (index === currentQuestion.correta) {
                    buttonClass += "bg-green-100 border-green-500 text-green-800";
                  } else if (index === selectedAnswer && !isCorrect) {
                    buttonClass += "bg-red-100 border-red-500 text-red-800";
                  } else {
                    buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
                  }
                } else if (selectedAnswer === index) {
                  buttonClass += "bg-purple-100 border-purple-500 text-purple-800 scale-[1.02] shadow-lg";
                } else {
                  buttonClass += "bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md active:scale-[0.98]";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1 text-left">{alternativa}</span>
                      {showResult && index === currentQuestion.correta && (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {showResult && index === selectedAnswer && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && currentQuestion.explicacao && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 md:p-6 rounded-lg mb-6 md:mb-8">
                <h3 className="font-bold text-blue-800 mb-2 text-sm md:text-base">Explicação:</h3>
                <p className="text-blue-700 leading-relaxed text-sm md:text-base">
                  {currentQuestion.explicacao}
                </p>
              </div>
            )}

            {/* Action button */}
            <div className="flex justify-center">
              {!showResult ? (
                <Button
                  onClick={handleConfirmAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg w-full md:w-auto min-h-[50px] md:min-h-[60px]"
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg w-full md:w-auto min-h-[50px] md:min-h-[60px]"
                >
                  {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedQuizPlay;
