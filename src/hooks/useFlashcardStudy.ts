
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { useRealGamificationData } from '@/hooks/useRealGamificationData';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface StudyStats {
  streak: number;
  totalReviewed: number;
  xpEarned: number;
}

interface Score {
  correct: number;
  incorrect: number;
}

export const useFlashcardStudy = (resumoId: string, sessionId?: string) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<Score>({ correct: 0, incorrect: 0 });
  const [studyStats, setStudyStats] = useState<StudyStats>({ streak: 0, totalReviewed: 0, xpEarned: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { toast } = useToast();
  const { addXP } = useGameification();
  const realGamificationData = useRealGamificationData();
  
  const {
    sessionId: activeSessionId,
    loading: sessionLoading,
    currentCardIndex: sessionCurrentIndex,
    completedCards: sessionCompletedCards,
    sessionStats,
    createOrResumeSession,
    saveProgress,
    completeSession,
    resetSession
  } = useFlashcardSession();

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

  // Initialize session once flashcards are loaded
  useEffect(() => {
    if (flashcards.length > 0 && !activeSessionId && !sessionLoading) {
      initializeSession();
    }
  }, [flashcards.length, activeSessionId, sessionLoading]);

  // Sync with session state
  useEffect(() => {
    if (activeSessionId && !sessionLoading) {
      console.log('🔄 Syncing with session state:', { sessionCurrentIndex, sessionStats });
      setCurrentIndex(sessionCurrentIndex);
      setCompletedCards(new Set(sessionCompletedCards));
      setStudyStats({
        streak: sessionStats.streak,
        totalReviewed: sessionStats.totalReviewed,
        xpEarned: sessionStats.xpEarned
      });
      setScore({
        correct: sessionStats.correct,
        incorrect: sessionStats.incorrect
      });
    }
  }, [activeSessionId, sessionLoading, sessionCurrentIndex, sessionCompletedCards, sessionStats]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSessionId) {
        saveCurrentProgress();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && activeSessionId) {
        saveCurrentProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeSessionId]);

  const initializeSession = async () => {
    console.log('🔄 Initializing flashcard session:', { resumoId, sessionId });
    await createOrResumeSession(resumoId, sessionId);
  };

  const fetchFlashcards = async () => {
    try {
      console.log('🔍 Carregando flashcards para resumo:', resumoId);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('data_criacao', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('✅ Flashcards carregados:', data.length);
        setFlashcards(data);
      } else {
        console.log('❌ Nenhum flashcard encontrado');
        toast({
          title: "Nenhum flashcard encontrado",
          description: "Este resumo ainda não possui flashcards. Gere alguns primeiro!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar flashcards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os flashcards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentProgress = useCallback(async () => {
    if (!activeSessionId) return;

    const updatedStats = {
      streak: studyStats.streak,
      totalReviewed: studyStats.totalReviewed,
      xpEarned: studyStats.xpEarned,
      correct: score.correct,
      incorrect: score.incorrect
    };

    await saveProgress(currentIndex, Array.from(completedCards), updatedStats);
  }, [activeSessionId, currentIndex, completedCards, studyStats, score, saveProgress]);

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setIsAnimating(false);
    }, 300);
  };

  const handleAnswer = async (remembered: boolean) => {
    if (flashcards.length === 0 || isAnimating) return;

    const currentCard = flashcards[currentIndex];
    const xpToAdd = remembered ? 5 : 1;
    
    console.log('📝 Registrando resposta:', { remembered, xpToAdd, cardId: currentCard.id });
    
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
          console.log('✅ Review registrado com sucesso');
        }

        // Adicionar XP através do sistema de gamificação
        try {
          await addXP(xpToAdd, 'flashcard');
          console.log('✅ XP adicionado:', xpToAdd);
          realGamificationData.refreshData(); // Atualizar dados reais
        } catch (xpError) {
          console.error('❌ Erro ao adicionar XP:', xpError);
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

      setStudyStats(newStats);
      setScore(newScore);
      setCompletedCards(prev => new Set([...prev, currentCard.id]));

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

      // Avançar para próximo card automaticamente após resposta
      setTimeout(() => {
        const nextIndex = currentIndex < flashcards.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(nextIndex);
        console.log('➡️ Avançando para card:', nextIndex);
        
        setShowAnswer(false);
        setIsFlipped(false);
      }, 1500);

    } catch (error) {
      console.error('❌ Erro ao registrar review:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar progresso",
        variant: "destructive",
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsFlipped(false);
    toast({
      title: "🎲 Cards embaralhados!",
      description: "Ordem dos flashcards foi alterada para variar o estudo.",
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeSessionId) {
        saveCurrentProgress();
      }
    };
  }, []);

  return {
    flashcards,
    currentIndex,
    showAnswer,
    loading: loading || sessionLoading,
    score,
    studyStats,
    isFlipped,
    completedCards,
    isAnimating,
    realGamificationData, // Dados reais de gamificação
    sessionId: activeSessionId,
    handleFlip,
    handleAnswer,
    handleShuffle,
    getCurrentCard: () => flashcards[currentIndex],
    saveCurrentProgress,
    completeSession
  };
};
