
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';
import { QuizSessionResult } from '@/types/quizGame';

export const useQuizScoring = () => {
  const { toast } = useToast();
  const { addXP } = useGameification();

  const handleCorrectAnswer = async () => {
    await addXP(10, 'quiz_correct');
    toast({
      title: '🎉 Correto! +10 XP',
      description: 'Excelente resposta!',
      duration: 2000,
    });
  };

  const handleIncorrectAnswer = async () => {
    await addXP(2, 'quiz_incorrect');
    toast({
      title: '😅 Incorreto, mas +2 XP por tentar!',
      description: 'Continue tentando!',
      duration: 2000,
    });
  };

  const calculateBonusXP = async (accuracy: number): Promise<number> => {
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

    return bonusXP;
  };

  const finalizeSessionResult = async (sessionResult: QuizSessionResult): Promise<QuizSessionResult> => {
    const bonusXP = await calculateBonusXP(sessionResult.accuracy);
    const totalXP = (sessionResult.correctAnswers * 10) + 
                   (sessionResult.totalQuestions - sessionResult.correctAnswers) * 2 + 
                   bonusXP;

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
