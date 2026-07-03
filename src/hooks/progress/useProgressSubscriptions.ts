
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProgressSubscriptions = (
  isInitialized: boolean,
  fetchProgressData: () => Promise<void>
) => {
  // Sufixo por instância: useRealTimeProgress/useUnifiedProgress pode ser
  // usado por mais de um componente ao mesmo tempo na mesma tela. Um nome
  // de canal fixo por user.id faz o supabase-js reutilizar a MESMA
  // instância entre eles — a segunda chamada de .subscribe() nessa
  // instância já "joined" lança "tried to subscribe multiple times" e
  // derruba a árvore React inteira via ErrorBoundary.
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!isInitialized) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      channel = supabase
        .channel(`progress-${user.id}-${instanceIdRef.current}`)
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
