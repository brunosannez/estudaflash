
import { useState, useEffect } from 'react';
import { useGameification } from '@/hooks/useGameification';
import { useQuizState } from '@/hooks/quiz/useQuizState';
import { useQuizDatabase } from '@/hooks/quiz/useQuizDatabase';
import { useQuizScoring } from '@/hooks/quiz/useQuizScoring';
import { QuizSessionResult } from '@/types/quizGame';

export const useQuizGame = (resumoId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionResult, setSessionResult] = useState<QuizSessionResult | null>(null);

  const { getStats } = useGameification();
  const { 
    gameState, 
    initializeQuiz, 
    selectAnswer, 
    confirmAnswer, 
    nextQuestion, 
    finishQuiz,
    updateTimer 
  } = useQuizState();
  
  const { loadQuestions, saveQuizAnswer, saveQuizSession } = useQuizDatabase();
  const { handleCorrectAnswer, handleIncorrectAnswer, finalizeSessionResult } = useQuizScoring();

  // Carregar perguntas do quiz
  const loadQuestionsHandler = async () => {
    if (!resumoId) return;
    
    setLoading(true);
    try {
      const questions = await loadQuestions(resumoId);
      if (questions.length > 0) {
        initializeQuiz(questions);
      }
    } finally {
      setLoading(false);
    }
  };

  // Confirmar resposta e registrar no banco
  const confirmAnswerHandler = async () => {
    if (gameState.selectedAnswer === null) return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correta;
    
    // Registrar resposta no banco de dados
    await saveQuizAnswer(currentQuestion.id, gameState.selectedAnswer, isCorrect);

    // Adicionar XP e mostrar feedback
    if (isCorrect) {
      await handleCorrectAnswer();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    } else {
      await handleIncorrectAnswer();
    }

    confirmAnswer(isCorrect);
  };

  // Finalizar quiz
  const finishQuizHandler = async () => {
    const endTime = Date.now();
    const completionTime = Math.round((endTime - gameState.startTime) / 1000);
    
    // Salvar sessão do quiz
    const result = await saveQuizSession(
      resumoId!,
      gameState.questions,
      gameState.userAnswers,
      gameState.score,
      completionTime
    );

    if (result) {
      const finalResult = await finalizeSessionResult(result);
      setSessionResult(finalResult);
    }

    finishQuiz();
  };

  // Reiniciar quiz
  const restartQuiz = () => {
    setSessionResult(null);
    loadQuestionsHandler();
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.timeRemaining > 0 && !gameState.isFinished && !gameState.showExplanation) {
      const timer = setTimeout(() => {
        updateTimer();
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState.timeRemaining === 0 && !gameState.isFinished) {
      finishQuizHandler();
    }
  }, [gameState.timeRemaining, gameState.isFinished, gameState.showExplanation]);

  // Propriedades derivadas para compatibilidade com QuizPlay
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const stats = getStats();
  const currentXP = stats?.currentXp || 0;
  const streakCount = stats?.currentStreak || 0;

  return {
    gameState,
    loading,
    loadQuestions: loadQuestionsHandler,
    selectAnswer,
    confirmAnswer: confirmAnswerHandler,
    nextQuestion,
    finishQuiz: finishQuizHandler,
    restartQuiz,
    
    // Propriedades compatíveis com QuizPlay
    currentQuestion,
    currentQuestionIndex: gameState.currentQuestionIndex,
    selectedAnswer: gameState.selectedAnswer,
    showResult: gameState.showExplanation,
    currentXP,
    streakCount,
    showCelebration,
    currentExplanation: currentQuestion?.explicacao || '',
    sessionResult,
    stats,
    handleAnswerSelect: selectAnswer,
    handleNextQuestion: gameState.showExplanation ? nextQuestion : confirmAnswerHandler,
  };
};

// Re-export types for backward compatibility
export type { QuizQuestion, QuizGameState } from '@/types/quizGame';
