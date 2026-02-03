
import { useCallback, startTransition } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProgressUpdater } from '@/hooks/progress/useProgressUpdater';
import { useAdvancedBadges } from '@/hooks/useAdvancedBadges';

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
  // New feedback props
  setShowFeedback: (show: boolean) => void;
  setUserChoice: (choice: 'correct' | 'incorrect' | null) => void;
  setLastXpEarned: (xp: number) => void;
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
  onComplete,
  setShowFeedback,
  setUserChoice,
  setLastXpEarned
}: UseFlashcardActionsProps) => {
  const { toast } = useToast();
  const { updateProgressAfterActivity } = useProgressUpdater();
  const { checkBadgesForActivity } = useAdvancedBadges();

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
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
    
    // Show feedback immediately (synchronous)
    setShowFeedback(true);
    setUserChoice(remembered ? 'correct' : 'incorrect');
    setLastXpEarned(xpToAdd);
    
    try {
      // Database operations in background
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

        // Update progress with correct XP
        try {
          await updateProgressAfterActivity('flashcard', xpToAdd);
          console.log('🎯 Progress updated for flashcard activity with XP:', xpToAdd);
        } catch (xpError) {
          console.error('❌ Erro ao atualizar progresso:', xpError);
        }
      }

      // Update local statistics
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

      // Non-urgent state updates wrapped in startTransition
      startTransition(() => {
        updateStats(newStats);
        updateScore(newScore);
        addCompletedCard(currentCard.id);
        realGamificationData.refreshData();
      });

      // Save session progress
      await saveProgress(
        currentIndex, 
        Array.from(new Set([...completedCards, currentCard.id])), 
        { ...newStats, correct: newScore.correct, incorrect: newScore.incorrect }
      );

      // Check for new badges (async, non-blocking)
      checkBadgesForActivity('flashcard', { remembered, totalReviewed: newStats.totalReviewed });

      // Visual feedback via toast
      toast({
        title: remembered ? "🎉 +10 XP!" : "💪 +2 XP por tentar!",
        description: remembered 
          ? "Excelente memória!" 
          : "Continue praticando, você está evoluindo!",
      });

    } catch (error) {
      console.error('❌ Erro ao registrar review:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar progresso",
        variant: "destructive",
      });
    }
  };

  const handleNextCard = () => {
    // Reset feedback states
    setShowFeedback(false);
    setUserChoice(null);
    setLastXpEarned(0);
    setShowAnswer(false);
    setIsFlipped(false);
    
    // Check if session is complete
    if (currentIndex + 1 >= flashcards.length) {
      console.log('📚 Todos os flashcards foram estudados!');
      if (onComplete) {
        onComplete();
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getCurrentCard = useCallback(() => {
    return flashcards[currentIndex];
  }, [flashcards, currentIndex]);

  return {
    handleFlip,
    handleAnswer,
    handleNextCard,
    getCurrentCard
  };
};
