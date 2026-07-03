
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface UseAdminRealTimeOptions {
  onUserChange?: (payload: any) => void;
  onSubscriptionChange?: (payload: any) => void;
  onUploadChange?: (payload: any) => void;
  enabled?: boolean;
}

export const useAdminRealTime = (options: UseAdminRealTimeOptions = {}) => {
  const {
    onUserChange,
    onSubscriptionChange,
    onUploadChange,
    enabled = true
  } = options;
  
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  // Sufixo por instância: AdminDashboard e UserManagement chamam este hook
  // de forma independente — um nome de canal fixo faz o supabase-js
  // reutilizar a mesma instância entre eles se ambos estiverem montados
  // ao mesmo tempo, e a segunda .subscribe() derruba a árvore React.
  const instanceIdRef = useRef(Math.random().toString(36).slice(2));

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    console.log('🔄 useAdminRealTime: Configurando canais real-time para admin...');

    const channel = supabase.channel(`admin-realtime-${instanceIdRef.current}`)
      // Monitorar mudanças em uso_usuarios
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios'
        },
        (payload) => {
          console.log('👤 Admin RT: Mudança em uso_usuarios:', payload.eventType);
          onUserChange?.(payload);
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      // Monitorar mudanças em subscriptions
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        (payload) => {
          console.log('💳 Admin RT: Mudança em subscriptions:', payload.eventType);
          onSubscriptionChange?.(payload);
          queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      // Monitorar novos uploads
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'uploads'
        },
        (payload) => {
          console.log('📤 Admin RT: Novo upload:', payload);
          onUploadChange?.(payload);
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Admin RT: Status da conexão:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('🔌 useAdminRealTime: Desconectando canais...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, onUserChange, onSubscriptionChange, onUploadChange, queryClient]);

  return {
    invalidateQueries
  };
};
