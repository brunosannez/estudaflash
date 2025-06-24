
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSimplifiedQuizSession } from '@/hooks/useSimplifiedQuizSession';
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
    sessionData, 
    loading, 
    error, 
    createSession, 
    resumeSession, 
    saveProgress, 
    completeSession,
    resetSession
  } = useSimplifiedQuizSession();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      if (gameFinished || sessionData) return;

      if (resumeMode && sessionId) {
        console.log('🔄 Resuming existing session:', sessionId);
        await resumeSession(sessionId);
      } else {
        console.log('🚀 Creating new session for resumo:', quiz.resumo_id);
        await createSession(quiz.resumo_id, quiz.questoes);
      }
    };

    if (quiz.questoes && quiz.questoes.length > 0) {
      initializeSession();
    }

    return () => {
      if (!gameFinished) {
        resetSession();
      }
    };
  }, [quiz.resumo_id, quiz.questoes, sessionId, resumeMode, gameFinished]);

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Erro no Quiz</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/quiz-history')}>
            Voltar ao Histórico
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionData || !sessionData.questoes || sessionData.questoes.length === 0) {
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

  if (gameFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Quiz Concluído!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Você acertou <span className="font-bold text-green-600">{sessionData.correctAnswers}</span> de{' '}
            <span className="font-bold">{sessionData.totalQuestions}</span> questões
          </p>
          <div className="text-lg text-gray-500 mb-8">
            Precisão: {Math.round((sessionData.correctAnswers / sessionData.totalQuestions) * 100)}%
          </div>
          <Button
            onClick={() => navigate('/quiz-history')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold"
          >
            Ver Histórico de Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionData.questoes[sessionData.currentQuestionIndex];
  if (!currentQuestion) {
    console.error('❌ Current question not found at index:', sessionData.currentQuestionIndex);
    return null;
  }

  const isLastQuestion = sessionData.currentQuestionIndex === sessionData.totalQuestions - 1;
  const progressPercentage = ((sessionData.currentQuestionIndex + 1) / sessionData.totalQuestions) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleConfirmAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correctAnswer = Number(currentQuestion.correta);
    const isAnswerCorrect = selectedAnswer === correctAnswer;
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    // Save progress
    const questionId = currentQuestion.id || `q_${sessionData.currentQuestionIndex}`;
    await saveProgress(questionId, selectedAnswer, isAnswerCorrect);

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
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      console.log('🏆 Quiz completed, finalizing...');
      
      const result = await completeSession();
      if (result) {
        setGameFinished(true);
        onComplete(result);
        
        // Bonus XP
        try {
          const accuracy = (sessionData.correctAnswers / sessionData.totalQuestions) * 100;
          
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
      }
    } else {
      console.log('➡️ Moving to next question');
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleExit = () => {
    const confirmExit = window.confirm(
      'Tem certeza que deseja sair do quiz? Seu progresso será salvo automaticamente.'
    );
    
    if (confirmExit) {
      toast.info('Progresso salvo! Você pode continuar o quiz depois.');
      navigate('/quiz-history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleExit}
          className="text-gray-600 hover:text-gray-800"
        >
          <X className="h-5 w-5 mr-2" />
          Sair
        </Button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">
            Questão {sessionData.currentQuestionIndex + 1} de {sessionData.totalQuestions}
          </div>
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">Pontuação</div>
          <div className="text-lg font-bold text-purple-600">
            {sessionData.correctAnswers}/{sessionData.totalQuestions}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.pergunta}
          </h2>

          {/* Alternatives */}
          <div className="space-y-4 mb-8">
            {currentQuestion.alternativas?.map((alternativa: string, index: number) => {
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 font-medium ";
              
              if (showResult) {
                if (index === currentQuestion.correta) {
                  buttonClass += "bg-green-100 border-green-500 text-green-800";
                } else if (index === selectedAnswer && !isCorrect) {
                  buttonClass += "bg-red-100 border-red-500 text-red-800";
                } else {
                  buttonClass += "bg-gray-100 border-gray-300 text-gray-600";
                }
              } else if (selectedAnswer === index) {
                buttonClass += "bg-purple-100 border-purple-500 text-purple-800";
              } else {
                buttonClass += "bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <span className="font-bold mr-3">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {alternativa}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQuestion.explicacao && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-blue-800 mb-2">Explicação:</h3>
              <p className="text-blue-700 leading-relaxed">
                {currentQuestion.explicacao}
              </p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            {!showResult ? (
              <Button
                onClick={handleConfirmAnswer}
                disabled={selectedAnswer === null}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg"
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg"
              >
                {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedQuizPlay;
