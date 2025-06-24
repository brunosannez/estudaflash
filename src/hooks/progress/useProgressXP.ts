
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProgressCalculations } from './useProgressCalculations';
import type { ProgressDataState } from './useProgressData';

export const useProgressXP = (
  data: ProgressDataState,
  setData: React.Dispatch<React.SetStateAction<ProgressDataState>>
) => {
  const { calculateLevel } = useProgressCalculations();

  const addXP = useCallback(async (xpAmount: number) => {
    if (!data.progress || !data.todayActivity) return;

    try {
      const newTotalXp = data.progress.total_xp + xpAmount;
      const newLevel = calculateLevel(newTotalXp);
      
      // Update local state immediately
      setData(prev => ({
        ...prev,
        progress: prev.progress ? {
          ...prev.progress,
          total_xp: newTotalXp,
          current_level: newLevel
        } : null,
        todayActivity: prev.todayActivity ? {
          ...prev.todayActivity,
          xp_earned: prev.todayActivity.xp_earned + xpAmount
        } : null
      }));

      // Update database in background
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Promise.all([
          supabase
            .from('user_progress')
            .update({ 
              total_xp: newTotalXp, 
              current_level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id),
          supabase
            .from('daily_activities')
            .update({ 
              xp_earned: data.todayActivity.xp_earned + xpAmount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('activity_date', new Date().toISOString().split('T')[0])
        ]);
      }

    } catch (error) {
      console.error('❌ Error adding XP:', error);
    }
  }, [data.progress, data.todayActivity, calculateLevel, setData]);

  return { addXP };
};
