
import React, { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedQuizSession } from '@/hooks/quiz/useUnifiedQuizSession';
import { useGameification } from '@/hooks/useGameification';
import { toast } from 'sonner';

// Component imports
import QuizProgressHeader from './components/QuizProgressHeader';
import QuizQuestionDisplay from './components/QuizQuestionDisplay';
import QuizAlternativesList from './components/QuizAlternativesList';
import QuizExplanation from './components/QuizExplanation';
import QuizActionButton from './components/QuizActionButton';
import QuizCompletionScreen from './components/QuizCompletionScreen';
import QuizLoadingScreen from './components/QuizLoadingScreen';
import QuizErrorScreen from './components/QuizErrorScreen';

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
    currentQuestionIndex,
    correctAnswers,
    totalQuestions,
    initialized,
    createOrResumeSession,
    saveAnswer,
    advanceToNextQuestion,
    resetSession
  } = useUnifiedQuizSession();

  // Local UI states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Calculate questions completed based on current question index
  const questionsCompleted = useMemo(() => {
    return currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Memoize current question to prevent recalculation
  const currentQuestion = useMemo(() => {
    if (!quiz.questoes || quiz.questoes.length === 0) return null;
    const index = Math.min(currentQuestionIndex, quiz.questoes.length - 1);
    return quiz.questoes[index];
  }, [quiz.questoes, currentQuestionIndex]);

  const isLastQuestion = useMemo(() => {
    return currentQuestionIndex === quiz.questoes.length - 1;
  }, [currentQuestionIndex, quiz.questoes.length]);

  // Initialize session once with proper guards
  useEffect(() => {
    if (!quiz.questoes || quiz.questoes.length === 0) return;
    if (initialized || sessionLoading) return;

    const initSession = async () => {
      console.log('🔄 Initializing unified session with:', { resumeMode, sessionId, questionsCount: quiz.questoes.length });
      await createOrResumeSession(quiz.resumo_id, quiz.questoes, sessionId);
    };

    initSession();
  }, [quiz.resumo_id, quiz.questoes, sessionId, initialized, sessionLoading, createOrResumeSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!gameFinished && activeSessionId) {
        console.log('🧹 Component unmounting, preserving session for later continuation');
        // Don't reset session - allow user to continue later
      }
    };
  }, [gameFinished, activeSessionId]);

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  }, [showResult]);

  const handleConfirmAnswer = useCallback(async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    const correctAnswer = Number(currentQuestion.correta);
    const isAnswerCorrect = selectedAnswer === correctAnswer;
    
    // Update UI state in transition
    startTransition(() => {
      setIsCorrect(isAnswerCorrect);
      setShowResult(true);
    });

    // Save answer to database
    const saved = await saveAnswer(currentQuestionIndex, selectedAnswer, isAnswerCorrect);
    
    if (saved) {
      console.log('✅ Answer saved to unified session');
    }

    // Add XP in background
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
  }, [selectedAnswer, currentQuestion, currentQuestionIndex, saveAnswer, addXP]);

  const handleNextQuestion = useCallback(async () => {
    if (isLastQuestion) {
      console.log('🏆 Quiz completed, finalizing...');
      
      startTransition(() => {
        setGameFinished(true);
      });
      
      const finalCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
      
      const result = {
        sessionId: activeSessionId,
        correctAnswers: finalCorrectAnswers,
        totalQuestions: quiz.questoes.length,
        accuracy: Math.round((finalCorrectAnswers / quiz.questoes.length) * 100)
      };
      
      onComplete(result);
      
      // Bonus XP in background
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
      
      // Advance to next question in database
      await advanceToNextQuestion();
      
      // Reset UI state for next question in transition
      startTransition(() => {
        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
      });
    }
  }, [isLastQuestion, correctAnswers, isCorrect, activeSessionId, quiz.questoes.length, onComplete, addXP, advanceToNextQuestion]);

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
      <QuizLoadingScreen 
        message={resumeMode ? 'Retomando quiz...' : 'Inicializando quiz...'}
      />
    );
  }

  // Error state
  if (sessionError) {
    return <QuizErrorScreen error={sessionError} />;
  }

  // No questions
  if (!quiz.questoes || quiz.questoes.length === 0) {
    return <QuizLoadingScreen message="Nenhuma questão encontrada" />;
  }

  // Game finished state
  if (gameFinished) {
    return (
      <QuizCompletionScreen 
        correctAnswers={correctAnswers}
        totalQuestions={quiz.questoes.length}
      />
    );
  }

  // No current question
  if (!currentQuestion) {
    console.error('❌ Current question not found at index:', currentQuestionIndex);
    return <QuizLoadingScreen message="Carregando questão..." />;
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      <QuizProgressHeader
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={quiz.questoes.length}
        questionsCompleted={questionsCompleted}
        correctAnswers={correctAnswers}
        onExit={handleExit}
      />

      {/* Question content */}
      <div className="p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            <QuizQuestionDisplay question={currentQuestion.pergunta} />

            <QuizAlternativesList
              alternatives={currentQuestion.alternativas}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              correctAnswer={currentQuestion.correta}
              isCorrect={isCorrect}
              onAnswerSelect={handleAnswerSelect}
            />

            <QuizExplanation
              explanation={currentQuestion.explicacao}
              showResult={showResult}
            />

            {/* Action button */}
            <div className="flex justify-center">
              <QuizActionButton
                showResult={showResult}
                selectedAnswer={selectedAnswer}
                isLastQuestion={isLastQuestion}
                onConfirmAnswer={handleConfirmAnswer}
                onNextQuestion={handleNextQuestion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedQuizPlay;
