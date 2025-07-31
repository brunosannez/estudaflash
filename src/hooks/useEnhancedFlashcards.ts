import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { EnhancedFlashcardService } from '@/services/enhancedFlashcardService';
import { SocialService } from '@/services/socialService';
import { 
  EnhancedFlashcard, 
  FlashcardCategory, 
  FlashcardStudyStats, 
  FlashcardStudyGoal,
  StudyModeConfig,
  StudySession
} from '@/types/flashcard';
import { toast } from 'sonner';

export const useEnhancedFlashcards = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<EnhancedFlashcard[]>([]);
  const [categories, setCategories] = useState<FlashcardCategory[]>([]);
  const [dueCards, setDueCards] = useState<EnhancedFlashcard[]>([]);
  const [studyStats, setStudyStats] = useState<FlashcardStudyStats[]>([]);
  const [activeGoals, setActiveGoals] = useState<FlashcardStudyGoal[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadInitialData();
    }
  }, [user?.id]);

  const loadInitialData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadDueCards(),
        loadStudyStats(),
        loadActiveGoals()
      ]);
    } catch (error) {
      console.error('Error loading flashcard data:', error);
      toast.error('Erro ao carregar dados dos flashcards');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!user?.id) return;
    const categories = await EnhancedFlashcardService.getCategories(user.id);
    setCategories(categories);
  };

  const loadDueCards = async () => {
    if (!user?.id) return;
    const dueCardsData = await EnhancedFlashcardService.getFlashcardsDueForReview(user.id);
    // Convert to EnhancedFlashcard format
    const enhancedDueCards = dueCardsData.map(card => ({
      id: card.flashcard_id,
      pergunta: card.pergunta,
      resposta: card.resposta,
      exemplo: card.exemplo,
      category: card.category,
      difficulty: card.difficulty,
      next_review_date: card.next_review_date,
      tags: [],
      repetition_count: 0,
      ef_factor: 2.5,
      is_favorite: false,
      data_criacao: new Date().toISOString(),
      resumo_id: ''
    }));
    setDueCards(enhancedDueCards);
  };

  const loadStudyStats = async () => {
    if (!user?.id) return;
    const stats = await EnhancedFlashcardService.getStudyStats(user.id, 30);
    setStudyStats(stats);
  };

  const loadActiveGoals = async () => {
    if (!user?.id) return;
    const goals = await EnhancedFlashcardService.getActiveGoals(user.id);
    setActiveGoals(goals);
  };

  // Study session management
  const startStudySession = useCallback(async (config: StudyModeConfig) => {
    if (!user?.id) return null;

    try {
      setLoading(true);
      const cards = await EnhancedFlashcardService.getFlashcardsByMode(user.id, config);
      
      if (cards.length === 0) {
        toast('Nenhum flashcard encontrado para esta configuração', { duration: 3000 });
        return null;
      }

      const session: StudySession = {
        sessionId: crypto.randomUUID(),
        startTime: new Date(),
        cards,
        currentIndex: 0,
        responses: [],
        stats: {
          totalCards: cards.length,
          reviewedCards: 0,
          correctAnswers: 0,
          totalTime: 0,
          xpEarned: 0
        }
      };

      setCurrentSession(session);
      toast.success(`Sessão iniciada com ${cards.length} flashcards! 🎯`, { duration: 3000 });
      return session;
    } catch (error) {
      console.error('Error starting study session:', error);
      toast.error('Erro ao iniciar sessão de estudo');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const answerCard = useCallback(async (
    flashcardId: string, 
    remembered: boolean, 
    responseTime: number,
    quality: number
  ) => {
    if (!currentSession || !user?.id) return;

    try {
      // Update flashcard with spaced repetition
      await EnhancedFlashcardService.updateFlashcardAfterReview(flashcardId, quality, responseTime);

      // Create review record
      await EnhancedFlashcardService.createReview({
        flashcard_id: flashcardId,
        user_id: user.id,
        lembrou: remembered,
        response_time_ms: responseTime,
        review_quality: quality
      });

      // Update session
      const updatedSession = { ...currentSession };
      updatedSession.responses.push({
        flashcardId,
        remembered,
        responseTime,
        quality
      });
      updatedSession.stats.reviewedCards++;
      if (remembered) {
        updatedSession.stats.correctAnswers++;
      }

      // Calculate XP (base + bonus for quality)
      const baseXP = remembered ? 10 : 2;
      const qualityBonus = Math.max(0, (quality - 2) * 2);
      const xpEarned = baseXP + qualityBonus;
      updatedSession.stats.xpEarned += xpEarned;

      setCurrentSession(updatedSession);

      // Move to next card or finish session
      if (updatedSession.currentIndex < updatedSession.cards.length - 1) {
        updatedSession.currentIndex++;
        setCurrentSession(updatedSession);
      } else {
        await finishStudySession(updatedSession);
      }

      toast.success(`+${xpEarned} XP! ${remembered ? '🎉' : '💪'}`, { duration: 2000 });
    } catch (error) {
      console.error('Error answering card:', error);
      toast.error('Erro ao registrar resposta');
    }
  }, [currentSession, user?.id]);

  const finishStudySession = async (session: StudySession) => {
    if (!user?.id) return;

    try {
      const sessionDuration = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60); // minutes
      
      // Update study stats
      await EnhancedFlashcardService.updateStudyStats(user.id, {
        cards_reviewed: session.stats.reviewedCards,
        cards_remembered: session.stats.correctAnswers,
        total_study_time_minutes: sessionDuration,
        xp_earned: session.stats.xpEarned,
        average_response_time_ms: Math.floor(
          session.responses.reduce((sum, r) => sum + r.responseTime, 0) / session.responses.length
        )
      });

      // Update goals progress
      await updateGoalsProgress(session.stats.reviewedCards);

      // Create social activity if significant achievement
      if (session.stats.correctAnswers === session.stats.totalCards && session.stats.totalCards >= 10) {
        await SocialService.createSocialActivity({
          user_id: user.id,
          activity_type: 'streak_milestone',
          title: 'Sessão Perfeita de Flashcards!',
          description: `Acertou ${session.stats.totalCards} flashcards seguidos!`,
          metadata: {
            cards: session.stats.totalCards,
            xp: session.stats.xpEarned
          },
          is_public: true
        });
      }

      setCurrentSession(null);
      await loadDueCards(); // Refresh due cards
      await loadStudyStats(); // Refresh stats

      toast.success(`Sessão concluída! ${session.stats.correctAnswers}/${session.stats.totalCards} corretas, +${session.stats.xpEarned} XP total! 🏆`, { 
        duration: 5000 
      });
    } catch (error) {
      console.error('Error finishing study session:', error);
      toast.error('Erro ao finalizar sessão');
    }
  };

  const updateGoalsProgress = async (cardsReviewed: number) => {
    if (!user?.id) return;

    for (const goal of activeGoals) {
      if (goal.goal_type === 'daily_cards') {
        const newProgress = goal.current_progress + cardsReviewed;
        if (newProgress >= goal.target_value) {
          await EnhancedFlashcardService.completeGoal(goal.id);
          toast.success(`🎯 Meta "${goal.goal_type}" concluída!`, { duration: 3000 });
        } else {
          await EnhancedFlashcardService.updateGoalProgress(goal.id, newProgress);
        }
      }
    }
    
    await loadActiveGoals(); // Refresh goals
  };

  // Category management
  const createCategory = async (name: string, description?: string, color?: string, icon?: string) => {
    if (!user?.id) return;

    try {
      await EnhancedFlashcardService.createCategory({
        user_id: user.id,
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || '📚'
      });
      
      await loadCategories();
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
    }
  };

  const updateFlashcard = async (flashcardId: string, updates: Partial<EnhancedFlashcard>) => {
    try {
      await EnhancedFlashcardService.updateFlashcard(flashcardId, updates);
      toast.success('Flashcard atualizado!');
      
      // Refresh current data
      if (currentSession) {
        const updatedSession = { ...currentSession };
        const cardIndex = updatedSession.cards.findIndex(c => c.id === flashcardId);
        if (cardIndex !== -1) {
          updatedSession.cards[cardIndex] = { ...updatedSession.cards[cardIndex], ...updates };
          setCurrentSession(updatedSession);
        }
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast.error('Erro ao atualizar flashcard');
    }
  };

  return {
    // Data
    flashcards,
    categories,
    dueCards,
    studyStats,
    activeGoals,
    currentSession,
    loading,

    // Actions
    startStudySession,
    answerCard,
    finishStudySession,
    createCategory,
    updateFlashcard,
    
    // Refresh functions
    loadInitialData,
    loadCategories,
    loadDueCards,
    loadStudyStats,
    loadActiveGoals
  };
};