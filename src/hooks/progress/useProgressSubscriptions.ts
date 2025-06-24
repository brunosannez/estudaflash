
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProgressSubscriptions = (
  isInitialized: boolean, 
  fetchProgressData: () => Promise<void>
) => {
  useEffect(() => {
    if (!isInitialized) return;

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`progress-${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'flashcard_reviews',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🔄 Flashcard activity detected, refreshing...');
          setTimeout(fetchProgressData, 1000);
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'quiz_respostas',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('🔄 Quiz activity detected, refreshing...');
          setTimeout(fetchProgressData, 1000);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscriptions();
  }, [isInitialized, fetchProgressData]);
};
