
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/use-toast";
import { useGameification } from '@/hooks/useGameification';
import { useQuiz } from '@/hooks/useQuiz';
import { useQuizSession } from '@/hooks/useQuizSession';

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
  const [sessionResult, setSessionResult] = useState<any>(null);
  
  const navigate = useNavigate();
  const { addXP, getStats } = useGameification();
  const { enviarResposta } = useQuiz(quiz.resumo_id || '');
  const { sessionData, startSession, addResponse, completeSession } = useQuizSession();

  const currentQuestion = quiz.questoes[currentQuestionIndex];
  const stats = getStats();

  // Iniciar sessão quando o quiz começar
  useEffect(() => {
    if (quiz && quiz.questoes && !sessionData) {
      // Para pegar o conteúdo do resumo, vamos usar um placeholder por enquanto
      // TODO: Integrar com dados reais do resumo se necessário
      startSession(quiz.resumo_id, "Conteúdo do resumo", quiz.questoes);
    }
  }, [quiz, sessionData, startSession]);

  // Call onComplete when we have a sessionResult
  useEffect(() => {
    if (sessionResult && onComplete) {
      onComplete();
    }
  }, [sessionResult, onComplete]);

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
    
    // Sistema de pontuação imediata (apenas visual, XP real será no final)
    const xpGained = isCorrect ? 10 : 2;
    setCurrentXP(prev => prev + xpGained);
    
    // Atualizar streak
    if (isCorrect) {
      setStreakCount(prev => prev + 1);
      triggerCelebration(true);
    } else {
      setStreakCount(0);
    }

    // Salvar resposta no banco de dados SEM adicionar XP ainda
    try {
      if (currentQuestion.id) {
        console.log('🔍 Enviando resposta para pergunta:', currentQuestion.id);
        const response = await enviarResposta(currentQuestion.id, index);
        console.log('📝 Resposta recebida:', response);
        
        // Adicionar resposta à sessão
        addResponse({
          quiz_id: currentQuestion.id,
          resposta_selecionada: index,
          acertou: isCorrect
        });
        
        if (response && response.explicacao) {
          console.log('💡 Explicação recebida:', response.explicacao);
          setCurrentExplanation(response.explicacao);
        } else if (currentQuestion.explicacao) {
          console.log('💡 Usando explicação da pergunta:', currentQuestion.explicacao);
          setCurrentExplanation(currentQuestion.explicacao);
        } else {
          console.log('⚠️ Nenhuma explicação disponível');
          setCurrentExplanation('');
        }
      }
      
      // Toast com feedback imediato (sem XP real ainda)
      toast({
        title: isCorrect ? "🎉 Correto!" : "💪 Continue tentando!",
        description: isCorrect 
          ? streakCount > 0 
            ? `Sequência de ${streakCount + 1} acertos! 🔥` 
            : "Excelente resposta! Continue assim!" 
          : "Não desista! Cada erro é um aprendizado.",
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      setCurrentExplanation(currentQuestion.explicacao || '');
    }
  };

  const handleNextQuestion = async () => {
    // Contar acerto se necessário
    if (selectedAnswer === currentQuestion.resposta_correta) {
      setCorrectAnswersCount(correctAnswersCount + 1);
    }

    // Reset states para próxima pergunta
    setSelectedAnswer(null);
    setShowResult(false);
    setCurrentExplanation('');

    // Verificar se é a última pergunta
    if (currentQuestionIndex < quiz.questoes.length - 1) {
      // Ir para próxima pergunta
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finalizar quiz e salvar sessão
      const finalCorrectCount = correctAnswersCount + (selectedAnswer === currentQuestion.resposta_correta ? 1 : 0);
      const correctPercentage = (finalCorrectCount / quiz.questoes.length) * 100;
      
      // Completar sessão
      const result = await completeSession();
      if (result) {
        setSessionResult(result);
      }

      // Calcular XP total baseado na performance final
      let totalXP = finalCorrectCount * 10 + (quiz.questoes.length - finalCorrectCount) * 2; // XP por resposta
      let bonusXP = 0;

      if (correctPercentage >= 90) {
        bonusXP = 100;
      } else if (correctPercentage >= 80) {
        bonusXP = 75;
      } else if (correctPercentage >= 70) {
        bonusXP = 50;
      } else if (correctPercentage >= 50) {
        bonusXP = 25;
      }

      totalXP += bonusXP;

      // Adicionar XP real agora
      await addXP(totalXP, 'quiz_complete');

      toast({
        title: "🏆 Quiz Completo!",
        description: `Você ganhou ${totalXP} XP total (${bonusXP} de bônus)!`,
        duration: 5000,
      });

      setQuizCompleted(true);

      // Navegar para histórico após pequeno delay
      setTimeout(() => {
        navigate('/quiz-history');
      }, 3000);
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
    sessionResult,
    stats,
    handleAnswerSelect,
    handleNextQuestion
  };
};
