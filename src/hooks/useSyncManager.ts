
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealUserCounts } from './useRealUserCounts';

export const useSyncManager = () => {
  const [syncing, setSyncing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  const { getRealUserCounts } = useRealUserCounts();

  const forceSyncUserData = async (userId: string) => {
    if (!userId) {
      console.log('❌ Usuário não autenticado');
      return false;
    }

    setSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização forçada para:', userId);

      // 1. Obter contagens reais
      const realCounts = await getRealUserCounts(userId);

      // 2. Verificar se já existe registro do usuário
      const { data: existingUsage, error: fetchError } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Erro ao buscar uso atual:', fetchError);
        throw fetchError;
      }

      // 3. Criar ou atualizar registro
      if (!existingUsage) {
        console.log('📝 Criando novo registro de uso...');
        
        // Get Free plan ID
        const { data: freePlan } = await supabase
          .from('plans')
          .select('id')
          .eq('name', 'Free')
          .single();

        const { error: insertError } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: userId,
            plan_id: freePlan?.id || '',
            uploads_realizados: realCounts.uploads,
            flashcards_gerados: realCounts.flashcards,
            quizzes_realizados: realCounts.quizzes,
            plano: 'free'
          });

        if (insertError) {
          console.error('❌ Erro ao criar registro:', insertError);
          throw insertError;
        }
      } else {
        console.log('🔄 Atualizando registro existente...');
        const { error: updateError } = await supabase
          .from('uso_usuarios')
          .update({
            uploads_realizados: realCounts.uploads,
            flashcards_gerados: realCounts.flashcards,
            quizzes_realizados: realCounts.quizzes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Erro ao atualizar registro:', updateError);
          throw updateError;
        }
      }

      console.log('✅ Sincronização completa! Dados atualizados:', realCounts);
      
      toast({
        title: "✅ Dados Sincronizados!",
        description: `Uploads: ${realCounts.uploads}, Flashcards: ${realCounts.flashcards}, Quizzes: ${realCounts.quizzes}`,
        duration: 3000,
      });

      setHasInitialized(true);
      return true;

    } catch (error) {
      console.error('❌ Erro crítico na sincronização:', error);
      toast({
        title: "❌ Erro na Sincronização",
        description: "Não foi possível sincronizar os dados. Tentando novamente...",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const ensureUserUsageExists = async (userId: string): Promise<void> => {
    try {
      const { data: existingUsage } = await supabase
        .from('uso_usuarios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingUsage) {
        console.log('🔄 Criando registro de uso para usuário:', userId);
        
        // Get Free plan ID
        const { data: freePlan } = await supabase
          .from('plans')
          .select('id')
          .eq('name', 'Free')
          .single();

        const { error } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: userId,
            plan_id: freePlan?.id || '',
            uploads_realizados: 0,
            flashcards_gerados: 0,
            quizzes_realizados: 0,
            plano: 'free',
          });

        if (error) {
          console.error('❌ Erro ao criar uso_usuarios:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Erro no ensureUserUsageExists:', error);
      throw error;
    }
  };

  return {
    syncing,
    hasInitialized,
    setHasInitialized,
    forceSyncUserData,
    ensureUserUsageExists,
  };
};
