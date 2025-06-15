
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProgress, DailyActivity, GameStats } from '@/types/gamification';
import { useProgressSync } from './useProgressSync';
import { getXpForNextLevel, calculateXpProgress } from '@/utils/gamificationUtils';

export const useRealTimeProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { syncUserProgressFromHistory, syncing } = useProgressSync();

  const fetchCurrentProgress = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching real-time progress for user:', user.id);

      // Primeiro sincroniza dados históricos
      const syncResult = await syncUserProgressFromHistory();
      
      if (syncResult.progress && syncResult.activity) {
        setProgress(syncResult.progress);
        setTodayActivity(syncResult.activity);
        setIsInitialized(true);
      }

    } catch (error) {
      console.error('❌ Erro ao buscar progresso em tempo real:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = (): GameStats | null => {
    if (!progress || !todayActivity) return null;

    try {
      const currentXp = progress.total_xp;
      const nextLevelXp = getXpForNextLevel(progress.current_level);
      const xpProgress = calculateXpProgress(currentXp, progress.current_level);

      return {
        currentLevel: progress.current_level,
        currentXp,
        nextLevelXp,
        currentLevelMinXp: progress.current_level === 1 ? 0 : 
          progress.current_level === 2 ? 50 : 
          progress.current_level === 3 ? 150 : 
          300 + (progress.current_level - 4) * 200,
        xpProgress: Math.min(100, Math.max(0, xpProgress)),
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        todayFlashcards: todayActivity.flashcards_reviewed,
        todayQuizzes: todayActivity.quizzes_completed,
        todayCorrectAnswers: todayActivity.quiz_correct_answers,
        todayXp: todayActivity.xp_earned
      };
    } catch (error) {
      console.error('❌ Erro ao gerar estatísticas:', error);
      return null;
    }
  };

  const refreshProgress = async () => {
    await fetchCurrentProgress();
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    fetchCurrentProgress();

    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !loading && !syncing) {
        await fetchCurrentProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Escutar mudanças em tempo real
  useEffect(() => {
    const setupRealtimeSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isInitialized) return;

      console.log('🔄 Setting up real-time subscriptions');

      const progressChannel = supabase
        .channel('progress_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_progress',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('🔄 Progress updated:', payload);
            if (payload.new) {
              setProgress(payload.new as UserProgress);
            }
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'daily_activities',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('🔄 Activity updated:', payload);
            if (payload.new) {
              setTodayActivity(payload.new as DailyActivity);
            }
          }
        )
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'flashcard_reviews',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('🔄 New flashcard review, refreshing...');
            setTimeout(refreshProgress, 1000);
          }
        )
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'quiz_respostas',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('🔄 New quiz answer, refreshing...');
            setTimeout(refreshProgress, 1000);
          }
        )
        .subscribe();

      return () => {
        progressChannel.unsubscribe();
      };
    };

    if (isInitialized) {
      setupRealtimeSubscriptions();
    }
  }, [isInitialized]);

  return {
    progress,
    todayActivity,
    loading: loading || syncing,
    isInitialized,
    getStats,
    refreshProgress
  };
};
