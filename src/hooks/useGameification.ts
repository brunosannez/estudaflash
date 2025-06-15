
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProgress, DailyActivity, ActivityType, GameStats } from "@/types/gamification";
import { GamificationService } from "@/services/gamificationService";
import { getXpForNextLevel, calculateXpProgress } from "@/utils/gamificationUtils";

export const useGameification = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Buscar progresso do usuário com tratamento robusto de erro
  const fetchUserProgress = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for gamification');
      setLoading(false);
      return;
    }

    try {
      console.log('🎮 Fetching gamification data for user:', user.id);
      
      // Buscar dados com retry em caso de falha
      let progressData = null;
      let activityData = null;
      
      try {
        progressData = await GamificationService.fetchOrCreateUserProgress(user.id);
        activityData = await GamificationService.fetchOrCreateDailyActivity(user.id);
      } catch (error) {
        console.error('❌ First attempt failed, retrying...', error);
        // Retry uma vez
        await new Promise(resolve => setTimeout(resolve, 1000));
        progressData = await GamificationService.fetchOrCreateUserProgress(user.id);
        activityData = await GamificationService.fetchOrCreateDailyActivity(user.id);
      }
      
      console.log('✅ Progress data loaded:', progressData);
      console.log('✅ Activity data loaded:', activityData);
      
      setProgress(progressData);
      setTodayActivity(activityData);
      setIsInitialized(true);
    } catch (error) {
      console.error("❌ Erro crítico ao buscar dados de gamificação:", error);
      
      // Criar dados padrão em caso de erro crítico
      const defaultProgress: UserProgress = {
        id: 'temp',
        user_id: user.id,
        total_xp: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null
      };
      
      const defaultActivity: DailyActivity = {
        id: 'temp',
        user_id: user.id,
        activity_date: new Date().toISOString().split('T')[0],
        flashcards_reviewed: 0,
        quizzes_completed: 0,
        quiz_correct_answers: 0,
        xp_earned: 0
      };
      
      setProgress(defaultProgress);
      setTodayActivity(defaultActivity);
      setIsInitialized(true);
      
      toast({
        title: "⚠️ Modo Offline",
        description: "Usando dados temporários. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar XP com retry e fallback
  const addXP = async (xpAmount: number, activityType: ActivityType) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !progress || !todayActivity) {
      console.log('❌ Cannot add XP: missing user, progress, or activity data');
      return;
    }

    try {
      console.log(`🎯 Adding ${xpAmount} XP for activity: ${activityType}`);
      
      // Atualizar estado local imediatamente para responsividade
      const newTotalXp = progress.total_xp + xpAmount;
      const newLevel = Math.floor(newTotalXp / 100) + 1; // Cálculo simplificado para demo
      
      setProgress(prev => prev ? {
        ...prev,
        total_xp: newTotalXp,
        current_level: newLevel
      } : null);
      
      setTodayActivity(prev => prev ? {
        ...prev,
        xp_earned: prev.xp_earned + xpAmount,
        ...(activityType === 'flashcard' && { flashcards_reviewed: prev.flashcards_reviewed + 1 }),
        ...(activityType === 'quiz_correct' && { 
          quizzes_completed: prev.quizzes_completed + 1,
          quiz_correct_answers: prev.quiz_correct_answers + 1 
        }),
        ...(activityType === 'quiz_incorrect' && { quizzes_completed: prev.quizzes_completed + 1 })
      } : null);

      // Tentar salvar no banco em background
      try {
        const updatedProgress = await GamificationService.updateUserProgress(
          user.id,
          progress,
          xpAmount
        );

        const updatedActivity = await GamificationService.updateDailyActivity(
          user.id,
          todayActivity,
          xpAmount,
          activityType
        );

        if (updatedProgress) {
          setProgress(updatedProgress);
          
          // Mostrar notificação se subiu de nível
          if (updatedProgress.current_level > progress.current_level) {
            toast({
              title: "🎉 Nível Aumentado!",
              description: `Parabéns! Você chegou ao nível ${updatedProgress.current_level}!`,
              duration: 5000,
            });
          }
        }
        
        if (updatedActivity) {
          setTodayActivity(updatedActivity);
        }
        
        console.log('✅ XP atualizado com sucesso no banco');
      } catch (dbError) {
        console.warn('⚠️ Falha ao salvar no banco, mas XP foi atualizado localmente:', dbError);
      }
    } catch (error) {
      console.error("❌ Erro ao adicionar XP:", error);
      toast({
        title: "Erro Temporário",
        description: "XP será sincronizado na próxima ação.",
        variant: "destructive",
      });
    }
  };

  // Buscar estatísticas com fallbacks seguros
  const getStats = (): GameStats | null => {
    if (!progress || !todayActivity) {
      console.log('❌ Cannot get stats: missing progress or activity data');
      return null;
    }

    try {
      const currentXp = progress.total_xp;
      const nextLevelXp = getXpForNextLevel(progress.current_level);
      const currentLevelMinXp = progress.current_level === 1 ? 0 : 
        progress.current_level === 2 ? 50 : 
        progress.current_level === 3 ? 150 : 
        300 + (progress.current_level - 4) * 200;

      const xpProgress = calculateXpProgress(currentXp, progress.current_level);

      const stats = {
        currentLevel: progress.current_level,
        currentXp,
        nextLevelXp,
        currentLevelMinXp,
        xpProgress: Math.min(100, Math.max(0, xpProgress)),
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        todayFlashcards: todayActivity.flashcards_reviewed,
        todayQuizzes: todayActivity.quizzes_completed,
        todayCorrectAnswers: todayActivity.quiz_correct_answers,
        todayXp: todayActivity.xp_earned
      };

      console.log('📊 Stats generated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error generating stats:', error);
      return null;
    }
  };

  // Auto-sincronizar dados periodicamente
  useEffect(() => {
    fetchUserProgress();
    
    // Refresh automático a cada 30 segundos se houver usuário
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !loading) {
        fetchUserProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Escutar mudanças em tempo real
  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Setting up real-time subscriptions');

      const progressChannel = supabase
        .channel('user_progress_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_progress',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('🔄 Progress updated in real-time:', payload);
            if (payload.new) {
              setProgress(payload.new as UserProgress);
            }
          }
        )
        .subscribe();

      const activityChannel = supabase
        .channel('daily_activities_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'daily_activities',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('🔄 Activity updated in real-time:', payload);
            if (payload.new) {
              setTodayActivity(payload.new as DailyActivity);
            }
          }
        )
        .subscribe();

      return () => {
        progressChannel.unsubscribe();
        activityChannel.unsubscribe();
      };
    };

    if (isInitialized) {
      setupRealtimeSubscriptions();
    }
  }, [isInitialized]);

  return {
    progress,
    todayActivity,
    loading,
    isInitialized,
    addXP,
    fetchUserProgress,
    getStats
  };
};

export * from "@/types/gamification";
