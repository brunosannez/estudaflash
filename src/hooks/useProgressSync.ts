
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProgress, DailyActivity } from '@/types/gamification';
import { ProgressSyncService } from '@/services/progressSyncService';

export const useProgressSync = () => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncUserProgressFromHistory = async (): Promise<{ progress: UserProgress | null; activity: DailyActivity | null }> => {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { progress: null, activity: null };

      const result = await ProgressSyncService.syncUserProgressFromHistory(user.id);

      if (result.progress && result.activity) {
        toast({
          title: "✅ Progresso Sincronizado!",
          description: `XP total: ${result.progress.total_xp} | Nível: ${result.progress.current_level} | Streak: ${result.progress.current_streak} dias`,
          duration: 5000,
        });
      }

      return result;

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      toast({
        title: "Erro na Sincronização",
        description: "Não foi possível sincronizar o progresso. Tente novamente.",
        variant: "destructive",
      });
      return { progress: null, activity: null };
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncUserProgressFromHistory,
    syncing
  };
};
