
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealGamificationData {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  flashcardsReviewedToday: number;
  loading: boolean;
}

export const useRealGamificationData = () => {
  const [data, setData] = useState<RealGamificationData>({
    totalXP: 0,
    currentLevel: 1,
    currentStreak: 0,
    longestStreak: 0,
    flashcardsReviewedToday: 0,
    loading: true
  });

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar dados do user_progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('total_xp, current_level, current_streak, longest_streak')
        .eq('user_id', user.id)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('❌ Error loading progress data:', progressError);
      }

      // Carregar atividades de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivity, error: activityError } = await supabase
        .from('daily_activities')
        .select('flashcards_reviewed')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .single();

      if (activityError && activityError.code !== 'PGRST116') {
        console.error('❌ Error loading today activity:', activityError);
      }

      setData({
        totalXP: progressData?.total_xp || 0,
        currentLevel: progressData?.current_level || 1,
        currentStreak: progressData?.current_streak || 0,
        longestStreak: progressData?.longest_streak || 0,
        flashcardsReviewedToday: todayActivity?.flashcards_reviewed || 0,
        loading: false
      });

      console.log('✅ Real gamification data loaded:', {
        totalXP: progressData?.total_xp || 0,
        level: progressData?.current_level || 1,
        streak: progressData?.current_streak || 0
      });

    } catch (error) {
      console.error('❌ Error loading real gamification data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const refreshData = () => {
    setData(prev => ({ ...prev, loading: true }));
    loadRealData();
  };

  return { ...data, refreshData };
};
