
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';

export interface QuizQuestion {
  id: string;
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
}

export interface QuizGameState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  userAnswers: (number | null)[];
  score: number;
  isFinished: boolean;
  showExplanation: boolean;
  timeRemaining: number;
  startTime: number;
}

export const useQuizGame = (resumoId: string | undefined) => {
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
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionResult, setSessionResult] = useState<any>(null);
  const { toast } = useToast();
  const { addXP, getStats } = useGameification();

  // Carregar perguntas do quiz
  const loadQuestions = async () => {
    if (!resumoId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('data_criacao', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const questions: QuizQuestion[] = data.map(quiz => ({
          id: quiz.id,
          pergunta: quiz.pergunta,
          alternativas: quiz.alternativas as string[],
          correta: quiz.correta,
          explicacao: quiz.explicacao,
        }));

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
      }
    } catch (error) {
      console.error('Erro ao carregar quiz:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar as perguntas do quiz',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Selecionar resposta
  const selectAnswer = (answerIndex: number) => {
    if (gameState.showExplanation || gameState.isFinished) return;

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
    }));
  };

  // Confirmar resposta e registrar no banco
  const confirmAnswer = async () => {
    if (gameState.selectedAnswer === null) return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correta;
    
    // Registrar resposta no banco de dados
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('quiz_respostas').insert({
          user_id: user.id,
          quiz_id: currentQuestion.id,
          resposta_selecionada: gameState.selectedAnswer,
          acertou: isCorrect,
        });

        // Adicionar XP baseado na resposta
        if (isCorrect) {
          await addXP(10, 'quiz_correct');
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 1000);
        } else {
          await addXP(2, 'quiz_incorrect'); // XP menor por tentar
        }
      }
    } catch (error) {
      console.error('Erro ao registrar resposta:', error);
    }

    const newUserAnswers = [...gameState.userAnswers];
    newUserAnswers[gameState.currentQuestionIndex] = gameState.selectedAnswer;

    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState(prev => ({
      ...prev,
      userAnswers: newUserAnswers,
      score: newScore,
      showExplanation: true,
    }));

    // Mostrar feedback
    if (isCorrect) {
      toast({
        title: '🎉 Correto! +10 XP',
        description: 'Excelente resposta!',
        duration: 2000,
      });
    } else {
      toast({
        title: '😅 Incorreto, mas +2 XP por tentar!',
        description: 'Continue tentando!',
        duration: 2000,
      });
    }
  };

  // Próxima pergunta
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

  // Finalizar quiz
  const finishQuiz = async () => {
    const endTime = Date.now();
    const completionTime = Math.round((endTime - gameState.startTime) / 1000);
    
    // Salvar sessão do quiz
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const questionsData = {
          questions: gameState.questions.map(q => ({
            id: q.id,
            pergunta: q.pergunta,
            alternativas: q.alternativas,
            correta: q.correta,
            explicacao: q.explicacao
          })),
          userAnswers: gameState.userAnswers,
        };

        const { data: sessionData, error } = await supabase.from('quiz_sessions').insert({
          user_id: user.id,
          resumo_id: resumoId!,
          quiz_title: `Quiz - ${gameState.questions.length} perguntas`,
          total_questions: gameState.questions.length,
          correct_answers: gameState.score,
          completion_time_seconds: completionTime,
          questions_data: questionsData,
        }).select().single();

        if (error) throw error;

        // XP de bônus baseado na performance
        const accuracy = (gameState.score / gameState.questions.length) * 100;
        let bonusXP = 0;
        let bonusMessage = '';

        if (accuracy === 100) {
          bonusXP = 50;
          bonusMessage = 'Perfeito! +50 XP de bônus!';
          await addXP(bonusXP, 'quiz_perfect');
        } else if (accuracy >= 80) {
          bonusXP = 25;
          bonusMessage = 'Excelente! +25 XP de bônus!';
          await addXP(bonusXP, 'quiz_excellent');
        } else if (accuracy >= 60) {
          bonusXP = 10;
          bonusMessage = 'Bom trabalho! +10 XP de bônus!';
          await addXP(bonusXP, 'quiz_good');
        }

        if (bonusXP > 0) {
          toast({
            title: '🎯 Bônus de Performance!',
            description: bonusMessage,
            duration: 4000,
          });
        }

        // Criar resultado da sessão
        const result = {
          id: sessionData.id,
          totalQuestions: gameState.questions.length,
          correctAnswers: gameState.score,
          accuracy: Math.round(accuracy),
          completionTime,
          bonusXP,
          totalXP: (gameState.score * 10) + (gameState.questions.length - gameState.score) * 2 + bonusXP,
          questions: gameState.questions,
          userAnswers: gameState.userAnswers,
        };

        setSessionResult(result);
      }
    } catch (error) {
      console.error('Erro ao salvar sessão do quiz:', error);
    }

    setGameState(prev => ({
      ...prev,
      isFinished: true,
    }));
  };

  // Reiniciar quiz
  const restartQuiz = () => {
    setSessionResult(null);
    loadQuestions();
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.timeRemaining > 0 && !gameState.isFinished && !gameState.showExplanation) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState.timeRemaining === 0 && !gameState.isFinished) {
      finishQuiz();
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
    loadQuestions,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    finishQuiz,
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
    handleNextQuestion: gameState.showExplanation ? nextQuestion : confirmAnswer,
  };
};
