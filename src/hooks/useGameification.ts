
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  flashcards_reviewed: number;
  quizzes_completed: number;
  quiz_correct_answers: number;
  xp_earned: number;
}

export const useGameification = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Calcular nível baseado no XP
  const calculateLevel = (xp: number): number => {
    if (xp <= 50) return 1;
    if (xp <= 150) return 2;
    if (xp <= 300) return 3;
    return Math.floor((xp - 300) / 200) + 4;
  };

  // Calcular XP necessário para o próximo nível
  const getXpForNextLevel = (currentLevel: number): number => {
    if (currentLevel === 1) return 50;
    if (currentLevel === 2) return 150;
    if (currentLevel === 3) return 300;
    return 300 + (currentLevel - 3) * 200;
  };

  // Buscar progresso do usuário
  const fetchUserProgress = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      console.error("Erro ao buscar progresso:", progressError);
    } else if (!progressData) {
      // Criar progresso inicial
      const { data: newProgress } = await supabase
        .from("user_progress")
        .insert({
          user_id: user.id,
          total_xp: 0,
          current_level: 1,
          current_streak: 0,
          longest_streak: 0
        })
        .select()
        .single();
      setProgress(newProgress);
    } else {
      setProgress(progressData);
    }

    // Buscar atividade de hoje
    const today = new Date().toISOString().split('T')[0];
    const { data: activityData } = await supabase
      .from("daily_activities")
      .select("*")
      .eq("user_id", user.id)
      .eq("activity_date", today)
      .single();

    if (!activityData) {
      // Criar atividade de hoje
      const { data: newActivity } = await supabase
        .from("daily_activities")
        .insert({
          user_id: user.id,
          activity_date: today,
          flashcards_reviewed: 0,
          quizzes_completed: 0,
          quiz_correct_answers: 0,
          xp_earned: 0
        })
        .select()
        .single();
      setTodayActivity(newActivity);
    } else {
      setTodayActivity(activityData);
    }

    setLoading(false);
  };

  // Adicionar XP e atualizar progresso
  const addXP = async (xpAmount: number, activityType: 'flashcard' | 'quiz_correct' | 'quiz_incorrect') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !progress || !todayActivity) return;

    const newTotalXp = progress.total_xp + xpAmount;
    const newLevel = calculateLevel(newTotalXp);
    const today = new Date().toISOString().split('T')[0];

    // Calcular streak
    let newStreak = progress.current_streak;
    if (progress.last_activity_date !== today) {
      const lastDate = progress.last_activity_date ? new Date(progress.last_activity_date) : null;
      const todayDate = new Date(today);
      
      if (lastDate) {
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = progress.current_streak + 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    // Atualizar progresso do usuário
    const { data: updatedProgress } = await supabase
      .from("user_progress")
      .update({
        total_xp: newTotalXp,
        current_level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, progress.longest_streak),
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id)
      .select()
      .single();

    // Atualizar atividade diária
    const updates: any = {
      xp_earned: todayActivity.xp_earned + xpAmount,
      updated_at: new Date().toISOString()
    };

    if (activityType === 'flashcard') {
      updates.flashcards_reviewed = todayActivity.flashcards_reviewed + 1;
    } else if (activityType === 'quiz_correct') {
      updates.quizzes_completed = todayActivity.quizzes_completed + 1;
      updates.quiz_correct_answers = todayActivity.quiz_correct_answers + 1;
    } else if (activityType === 'quiz_incorrect') {
      updates.quizzes_completed = todayActivity.quizzes_completed + 1;
    }

    const { data: updatedActivity } = await supabase
      .from("daily_activities")
      .update(updates)
      .eq("user_id", user.id)
      .eq("activity_date", today)
      .select()
      .single();

    if (updatedProgress) setProgress(updatedProgress);
    if (updatedActivity) setTodayActivity(updatedActivity);

    // Mostrar notificação se subiu de nível
    if (newLevel > progress.current_level) {
      toast({
        title: "🎉 Nível Aumentado!",
        description: `Parabéns! Você chegou ao nível ${newLevel}!`,
        duration: 5000,
      });
    }
  };

  // Buscar estatísticas gerais
  const getStats = () => {
    if (!progress || !todayActivity) return null;

    const currentXp = progress.total_xp;
    const nextLevelXp = getXpForNextLevel(progress.current_level);
    const currentLevelMinXp = progress.current_level === 1 ? 0 : 
      progress.current_level === 2 ? 50 : 
      progress.current_level === 3 ? 150 : 
      300 + (progress.current_level - 4) * 200;

    return {
      currentLevel: progress.current_level,
      currentXp,
      nextLevelXp,
      currentLevelMinXp,
      xpProgress: ((currentXp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100,
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      todayFlashcards: todayActivity.flashcards_reviewed,
      todayQuizzes: todayActivity.quizzes_completed,
      todayCorrectAnswers: todayActivity.quiz_correct_answers,
      todayXp: todayActivity.xp_earned
    };
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  return {
    progress,
    todayActivity,
    loading,
    addXP,
    fetchUserProgress,
    getStats
  };
};
