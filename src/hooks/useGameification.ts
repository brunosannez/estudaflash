
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserProgress, DailyActivity, ActivityType, GameStats } from "@/types/gamification";
import { GamificationService } from "@/services/gamificationService";
import { getXpForNextLevel, calculateXpProgress } from "@/utils/gamificationUtils";
import { useRealTimeProgress } from "./useRealTimeProgress";

export const useGameification = () => {
  const { toast } = useToast();
  const realTimeProgress = useRealTimeProgress();

  // Usar os dados do hook de tempo real como base
  const [progress, setProgress] = useState<UserProgress | null>(realTimeProgress.progress);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(realTimeProgress.todayActivity);
  const [loading, setLoading] = useState(realTimeProgress.loading);
  const [isInitialized, setIsInitialized] = useState(realTimeProgress.isInitialized);

  // Sincronizar com os dados do hook de tempo real
  useEffect(() => {
    setProgress(realTimeProgress.progress);
    setTodayActivity(realTimeProgress.todayActivity);
    setLoading(realTimeProgress.loading);
    setIsInitialized(realTimeProgress.isInitialized);
  }, [realTimeProgress.progress, realTimeProgress.todayActivity, realTimeProgress.loading, realTimeProgress.isInitialized]);

  // Buscar progresso do usuário
  const fetchUserProgress = async () => {
    await realTimeProgress.refreshProgress();
  };

  // Adicionar XP com atualização em tempo real
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
        
        // Refresh do progresso em tempo real após alguns segundos
        setTimeout(() => {
          realTimeProgress.refreshProgress();
        }, 2000);
        
      } catch (dbError) {
        console.warn('⚠️ Falha ao salvar no banco, mas XP foi atualizado localmente:', dbError);
        // Refresh do progresso em caso de erro
        setTimeout(() => {
          realTimeProgress.refreshProgress();
        }, 3000);
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

  // Buscar estatísticas usando dados em tempo real
  const getStats = (): GameStats | null => {
    return realTimeProgress.getStats();
  };

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
