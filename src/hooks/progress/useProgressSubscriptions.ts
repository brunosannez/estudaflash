
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProgressSubscriptions = (
  isInitialized: boolean, 
  fetchProgressData: () => Promise<void>
) => {
  useEffect(() => {
    if (!isInitialized) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      channel = supabase
        .channel(`progress-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🔄 user_progress updated, refreshing...');
          setTimeout(fetchProgressData, 500);
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'daily_activities',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🔄 daily_activities updated, refreshing...');
          setTimeout(fetchProgressData, 500);
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [isInitialized, fetchProgressData]);
};
