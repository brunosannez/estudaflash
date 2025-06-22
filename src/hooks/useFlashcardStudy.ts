
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';

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

export const useFlashcardStudy = (resumoId: string) => {
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

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

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

      setStudyStats(newStats);
      setScore(prev => ({
        correct: remembered ? prev.correct + 1 : prev.correct,
        incorrect: remembered ? prev.incorrect : prev.incorrect + 1
      }));

      setCompletedCards(prev => new Set([...prev, currentCard.id]));

      // Feedback visual melhorado
      toast({
        title: remembered ? "🎉 Excelente!" : "💪 Continue tentando!",
        description: remembered 
          ? `+${xpToAdd} XP! Sequência: ${newStats.streak}` 
          : `+${xpToAdd} XP por tentar! Você está aprendendo!`,
      });

      // Avançar para próximo card automaticamente após resposta
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          console.log('➡️ Avançando para próximo card:', currentIndex + 1);
        } else {
          // Reiniciar do começo se chegou ao fim
          setCurrentIndex(0);
          console.log('🔄 Reiniciando do primeiro card');
        }
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

  return {
    flashcards,
    currentIndex,
    showAnswer,
    loading,
    score,
    studyStats,
    isFlipped,
    completedCards,
    isAnimating,
    handleFlip,
    handleAnswer,
    handleShuffle,
    getCurrentCard: () => flashcards[currentIndex]
  };
};
