
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageDataService } from '@/services/usageDataService';
import { supabase } from '@/integrations/supabase/client';

export const useDataSync = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const forceSyncUserData = useCallback(async () => {
    if (!user) {
      console.log('👤 No user to sync');
      setHasInitialized(true);
      return;
    }

    setSyncing(true);
    console.log('🔄 Forçando sincronização de dados do usuário...');

    try {
      // 1. Garantir que o usuário existe na tabela uso_usuarios
      await UsageDataService.getUserUsage(user.id);
      console.log('✅ Dados de uso sincronizados');

      // 2. Verificar se o progresso do usuário existe
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar progresso:', progressError);
      }

      if (!progressData) {
        console.log('📝 Criando progresso inicial do usuário...');
        const { error: createError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0
          });

        if (createError) {
          console.error('❌ Erro ao criar progresso:', createError);
        } else {
          console.log('✅ Progresso inicial criado');
        }
      }

      // 3. Verificar atividade diária
      const today = new Date().toISOString().split('T')[0];
      const { data: activityData, error: activityError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .maybeSingle();

      if (activityError && activityError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar atividade:', activityError);
      }

      if (!activityData) {
        console.log('📅 Criando atividade diária...');
        const { error: createActivityError } = await supabase
          .from('daily_activities')
          .insert({
            user_id: user.id,
            activity_date: today,
            flashcards_reviewed: 0,
            quizzes_completed: 0,
            quiz_correct_answers: 0,
            xp_earned: 0
          });

        if (createActivityError) {
          console.error('❌ Erro ao criar atividade:', createActivityError);
        } else {
          console.log('✅ Atividade diária criada');
        }
      }

      setLastSync(new Date());
      console.log('✅ Sincronização completa realizada com sucesso');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    } finally {
      setSyncing(false);
      setHasInitialized(true);
    }
  }, [user]);

  // Sincronização inicial
  useEffect(() => {
    if (user && !hasInitialized) {
      forceSyncUserData();
    } else if (!user) {
      setHasInitialized(true);
    }
  }, [user, hasInitialized, forceSyncUserData]);

  return {
    forceSyncUserData,
    syncing,
    lastSync,
    hasInitialized
  };
};
