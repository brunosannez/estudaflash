
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { useGameification } from '@/hooks/useGameification';
import { useQuiz } from '@/hooks/useQuiz';

export const useQuizGame = (quiz: any, onComplete: () => void) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  
  const navigate = useNavigate();
  const { addXP, getStats } = useGameification();
  const { enviarResposta } = useQuiz(quiz.resumo_id || '');

  const currentQuestion = quiz.questoes[currentQuestionIndex];
  const stats = getStats();

  useEffect(() => {
    if (quizCompleted) {
      onComplete();
    }
  }, [quizCompleted, onComplete]);

  const triggerCelebration = (isCorrect: boolean) => {
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const handleAnswerSelect = async (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === currentQuestion.resposta_correta;
    
    // Sistema de pontuação imediata
    const xpGained = isCorrect ? 10 : 2;
    setCurrentXP(prev => prev + xpGained);
    
    // Atualizar streak
    if (isCorrect) {
      setStreakCount(prev => prev + 1);
      triggerCelebration(true);
    } else {
      setStreakCount(0);
    }

    // Salvar resposta no banco de dados e adicionar XP
    try {
      if (quiz.questoes[0].id) {
        const response = await enviarResposta(quiz.questoes[0].id, index);
        if (response && response.explicacao) {
          setCurrentExplanation(response.explicacao);
        }
      }
      
      await addXP(xpGained, isCorrect ? 'quiz_correct' : 'quiz_incorrect');
      
      // Toast com animação de XP
      toast({
        title: isCorrect ? "🎉 Correto! +" + xpGained + " XP" : "💪 +" + xpGained + " XP pela tentativa",
        description: isCorrect 
          ? streakCount > 0 
            ? `Sequência de ${streakCount + 1} acertos! 🔥` 
            : "Excelente resposta! Continue assim!" 
          : "Não desista! Cada erro é um aprendizado.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === currentQuestion.resposta_correta) {
      setCorrectAnswersCount(correctAnswersCount + 1);
    }

    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentExplanation('');

    if (currentQuestionIndex < quiz.questoes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
      const correctPercentage = ((correctAnswersCount + (selectedAnswer === currentQuestion.resposta_correta ? 1 : 0)) / quiz.questoes.length) * 100;
      let bonusXP = 50;

      if (correctPercentage >= 90) {
        bonusXP = 100;
      } else if (correctPercentage >= 80) {
        bonusXP = 75;
      }

      addXP(bonusXP, 'quiz_complete');

      toast({
        title: "🏆 Quiz Completo!",
        description: `Você ganhou +${bonusXP} XP de bônus! Total: ${currentXP + bonusXP} XP!`,
        duration: 5000,
      });

      navigate('/quiz-history');
    }
  };

  return {
    currentQuestion,
    currentQuestionIndex,
    selectedAnswer,
    showResult,
    currentXP,
    streakCount,
    showCelebration,
    currentExplanation,
    stats,
    handleAnswerSelect,
    handleNextQuestion
  };
};
