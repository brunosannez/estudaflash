
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeSubscriptions = (
  onDataChange: () => void,
  isEnabled: boolean = true
) => {
  // Sufixo por instância — ver comentário em useProgressSubscriptions/
  // useUnifiedRealTime. Nome de canal literal fixo colidiria entre
  // qualquer par de componentes que usasse este hook na mesma tela.
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!isEnabled) return;

    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Setting up real-time subscriptions...');

      const channel = supabase
        .channel(`dashboard_stats_realtime-${instanceIdRef.current}`)
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
