
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeSubscriptions = (
  onDataChange: () => void,
  isEnabled: boolean = true
) => {
  useEffect(() => {
    if (!isEnabled) return;

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Setting up real-time subscriptions...');

      const channel = supabase
        .channel('dashboard_stats_realtime')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'quiz_sessions',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('📡 Quiz session changed, refreshing stats...');
            setTimeout(onDataChange, 1000);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'resumos'
          }, 
          () => {
            console.log('📡 Resumo changed, refreshing stats...');
            setTimeout(onDataChange, 1000);
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'flashcard_reviews',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            console.log('📡 Flashcard review changed, refreshing stats...');
            setTimeout(onDataChange, 1000);
          }
        )
        .subscribe();

      return () => {
        console.log('🔌 Cleaning up real-time subscriptions');
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupSubscriptions();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [onDataChange, isEnabled]);
};
