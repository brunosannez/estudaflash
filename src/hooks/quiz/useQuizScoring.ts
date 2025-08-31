
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';
import { QuizSessionResult } from '@/types/quizGame';

export const useQuizScoring = () => {
  const { toast } = useToast();
  const { addXP } = useGameification();

  const handleCorrectAnswer = async () => {
    await addXP(15, 'quiz_correct'); // Increased XP for correct answers
    toast({
      title: '🎉 Correto! +15 XP',
      description: 'Excelente resposta!',
      duration: 2000,
    });
  };

  const handleIncorrectAnswer = async () => {
    await addXP(3, 'quiz_incorrect'); // Small XP for trying
    toast({
      title: '😅 Incorreto, mas +3 XP por tentar!',
      description: 'Continue tentando!',
      duration: 2000,
    });
  };

  const calculateBonusXP = async (accuracy: number): Promise<number> => {
    let bonusXP = 0;
    let bonusMessage = '';

    if (accuracy === 100) {
      bonusXP = 50;
      bonusMessage = '🏆 Perfeito! +50 XP de bônus!';
      await addXP(bonusXP, 'quiz_perfect');
    } else if (accuracy >= 90) {
      bonusXP = 30;
      bonusMessage = '⭐ Excelente! +30 XP de bônus!';
      await addXP(bonusXP, 'quiz_excellent');
    } else if (accuracy >= 80) {
      bonusXP = 20;
      bonusMessage = '👏 Muito bom! +20 XP de bônus!';
      await addXP(bonusXP, 'quiz_excellent');
    } else if (accuracy >= 70) {
      bonusXP = 10;
      bonusMessage = '👍 Bom trabalho! +10 XP de bônus!';
      await addXP(bonusXP, 'quiz_good');
    }

    if (bonusXP > 0) {
      toast({
        title: '🎯 Bônus de Performance!',
        description: bonusMessage,
        duration: 4000,
      });
    }

    return bonusXP;
  };

  const finalizeSessionResult = async (sessionResult: QuizSessionResult): Promise<QuizSessionResult> => {
    const bonusXP = await calculateBonusXP(sessionResult.accuracy);
    
    // Calculate total XP: base points + incorrect attempt points + bonus
    const baseXP = sessionResult.correctAnswers * 15; // 15 XP per correct answer
    const attemptXP = (sessionResult.totalQuestions - sessionResult.correctAnswers) * 3; // 3 XP per incorrect attempt
    const totalXP = baseXP + attemptXP + bonusXP;

    return {
      ...sessionResult,
      bonusXP,
      totalXP,
    };
  };

  return {
    handleCorrectAnswer,
    handleIncorrectAnswer,
    calculateBonusXP,
    finalizeSessionResult,
  };
};
