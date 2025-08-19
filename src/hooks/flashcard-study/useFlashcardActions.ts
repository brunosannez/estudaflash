
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProgressUpdater } from '@/hooks/progress/useProgressUpdater';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface UseFlashcardActionsProps {
  flashcards: Flashcard[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  showAnswer: boolean;
  setShowAnswer: (show: boolean) => void;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  studyStats: any;
  score: any;
  updateStats: (stats: any) => void;
  updateScore: (score: any) => void;
  addCompletedCard: (cardId: string) => void;
  completedCards: Set<string>;
  saveProgress: (currentIndex: number, completedCardIds: string[], stats: any) => Promise<boolean>;
  realGamificationData: any;
  onComplete?: () => void;
}

export const useFlashcardActions = ({
  flashcards,
  currentIndex,
  setCurrentIndex,
  showAnswer,
  setShowAnswer,
  isFlipped,
  setIsFlipped,
  isAnimating,
  setIsAnimating,
  studyStats,
  score,
  updateStats,
  updateScore,
  addCompletedCard,
  completedCards,
  saveProgress,
  realGamificationData,
  onComplete
}: UseFlashcardActionsProps) => {
  const { toast } = useToast();
  const { updateProgressAfterActivity } = useProgressUpdater();

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Simples toggle da resposta sem animação complexa
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setIsFlipped(!isFlipped);
      setIsAnimating(false);
    }, 150);
  };

  const handleAnswer = async (remembered: boolean) => {
    if (flashcards.length === 0 || isAnimating) return;
    
    const currentCard = flashcards[currentIndex];
    const xpToAdd = remembered ? 10 : 2;
    
    console.log('📝 Registrando resposta flashcard:', { remembered, xpToAdd, cardId: currentCard.id });
    
    try {
      // Registrar review no banco
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: reviewError } = await supabase.from('flashcard_reviews').insert({
          flashcard_id: currentCard.id,
          user_id: user.id,
          lembrou: remembered
        });

        if (reviewError) {
          console.error('❌ Erro ao registrar review:', reviewError);
        } else {
          console.log('✅ Flashcard review registrado com sucesso');
        }

        // Atualizar sistema de progresso com XP correto
        try {
          await updateProgressAfterActivity('flashcard', xpToAdd);
          console.log('🎯 Progress updated for flashcard activity with XP:', xpToAdd);
          realGamificationData.refreshData(); // Atualizar dados reais
        } catch (xpError) {
          console.error('❌ Erro ao atualizar progresso:', xpError);
        }
      }

      // Atualizar estatísticas locais
      const newStats = {
        ...studyStats,
        totalReviewed: studyStats.totalReviewed + 1,
        streak: remembered ? studyStats.streak + 1 : 0,
        xpEarned: studyStats.xpEarned + xpToAdd
      };

      const newScore = {
        correct: remembered ? score.correct + 1 : score.correct,
        incorrect: remembered ? score.incorrect : score.incorrect + 1
      };

      updateStats(newStats);
      updateScore(newScore);
      addCompletedCard(currentCard.id);

      // Salvar progresso na sessão
      await saveProgress(
        currentIndex, 
        Array.from(new Set([...completedCards, currentCard.id])), 
        { ...newStats, correct: newScore.correct, incorrect: newScore.incorrect }
      );

      // Feedback visual melhorado
      toast({
        title: remembered ? "🎉 Excelente!" : "💪 Continue tentando!",
        description: remembered 
          ? `+${xpToAdd} XP! Sequência: ${newStats.streak}` 
          : `+${xpToAdd} XP por tentar! Você está aprendendo!`,
      });

      // Avançar para próximo card ou finalizar
      setTimeout(() => {
        if (currentIndex + 1 >= flashcards.length) {
          console.log('📚 Todos os flashcards foram estudados!');
          if (onComplete) {
            onComplete();
          }
        } else {
          setCurrentIndex(currentIndex + 1);
          setShowAnswer(false);
          setIsFlipped(false);
        }
      }, 300);

    } catch (error) {
      console.error('❌ Erro ao registrar review:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar progresso",
        variant: "destructive",
      });
    }
  };

  const getCurrentCard = useCallback(() => {
    return flashcards[currentIndex];
  }, [flashcards, currentIndex]);

  return {
    handleFlip,
    handleAnswer,
    getCurrentCard
  };
};
