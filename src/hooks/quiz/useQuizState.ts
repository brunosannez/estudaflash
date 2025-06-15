
import { useState } from 'react';
import { QuizGameState, QuizQuestion } from '@/types/quizGame';

export const useQuizState = () => {
  const [gameState, setGameState] = useState<QuizGameState>({
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    userAnswers: [],
    score: 0,
    isFinished: false,
    showExplanation: false,
    timeRemaining: 0,
    startTime: 0,
  });

  const initializeQuiz = (questions: QuizQuestion[]) => {
    setGameState({
      questions,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      userAnswers: new Array(questions.length).fill(null),
      score: 0,
      isFinished: false,
      showExplanation: false,
      timeRemaining: questions.length * 30, // 30 segundos por pergunta
      startTime: Date.now(),
    });
  };

  const selectAnswer = (answerIndex: number) => {
    if (gameState.showExplanation || gameState.isFinished) return;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
    }));
  };

  const confirmAnswer = (isCorrect: boolean) => {
    const newUserAnswers = [...gameState.userAnswers];
    newUserAnswers[gameState.currentQuestionIndex] = gameState.selectedAnswer;

    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState(prev => ({
      ...prev,
      userAnswers: newUserAnswers,
      score: newScore,
      showExplanation: true,
    }));
  };

  const nextQuestion = () => {
    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswer: null,
        showExplanation: false,
      }));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setGameState(prev => ({
      ...prev,
      isFinished: true,
    }));
  };

  const updateTimer = () => {
    setGameState(prev => ({
      ...prev,
      timeRemaining: prev.timeRemaining - 1,
    }));
  };

  return {
    gameState,
    setGameState,
    initializeQuiz,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    finishQuiz,
    updateTimer,
  };
};
