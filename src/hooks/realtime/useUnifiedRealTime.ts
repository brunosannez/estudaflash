
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RealTimeCallbacks {
  onBadgeEarned?: () => void;
  onUsageChanged?: () => void;
  onProgressChanged?: () => void;
  onActivityChanged?: () => void;
  onQuizCompleted?: () => void;
  onFlashcardReviewed?: () => void;
}

export const useUnifiedRealTime = (callbacks: RealTimeCallbacks) => {
  const { user } = useAuth();
  const callbacksRef = useRef(callbacks);
  
  // Keep callbacks ref updated to avoid stale closures
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!user) return;

    console.log('🔌 Setting up unified real-time subscriptions for user:', user.id);

    const channel = supabase
      .channel(`unified-realtime-${user.id}`)
      // Badges - quando um novo badge é ganho
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🏆 Real-time: New badge earned!', payload.new);
        setTimeout(() => callbacksRef.current.onBadgeEarned?.(), 300);
      })
      // Uso - quando contadores de uso mudam
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'uso_usuarios',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('📊 Real-time: Usage updated');
        setTimeout(() => callbacksRef.current.onUsageChanged?.(), 300);
      })
      // Progresso do usuário
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('📈 Real-time: Progress updated');
        setTimeout(() => callbacksRef.current.onProgressChanged?.(), 300);
      })
      // Atividades diárias
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_activities',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('📅 Real-time: Daily activity updated');
        setTimeout(() => callbacksRef.current.onActivityChanged?.(), 300);
      })
      // Quiz ENEM sessions
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enem_quiz_sessions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('🧠 Real-time: Quiz session updated');
        setTimeout(() => callbacksRef.current.onQuizCompleted?.(), 300);
      })
      // Flashcard reviews
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'flashcard_reviews',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('🃏 Real-time: Flashcard reviewed');
        setTimeout(() => callbacksRef.current.onFlashcardReviewed?.(), 300);
      })
      .subscribe((status) => {
        console.log('🔌 Unified real-time subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up unified real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [user]);
};

// Hook simplificado para componentes que só precisam de badges
export const useBadgesRealTime = (onBadgeEarned: () => void) => {
  const { user } = useAuth();
  const callbackRef = useRef(onBadgeEarned);
  
  useEffect(() => {
    callbackRef.current = onBadgeEarned;
  }, [onBadgeEarned]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`badges-rt-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('🏆 Badge real-time update');
        setTimeout(() => callbackRef.current(), 300);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};

// Hook simplificado para componentes que só precisam de uso
export const useUsageRealTime = (onUsageChanged: () => void) => {
  const { user } = useAuth();
  const callbackRef = useRef(onUsageChanged);
  
  useEffect(() => {
    callbackRef.current = onUsageChanged;
  }, [onUsageChanged]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`usage-rt-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'uso_usuarios',
        filter: `user_id=eq.${user.id}`
      }, () => {
        console.log('📊 Usage real-time update');
        setTimeout(() => callbackRef.current(), 300);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
