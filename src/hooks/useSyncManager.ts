
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
        const { error: insertError } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: userId,
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

  return {
    syncing,
    hasInitialized,
    setHasInitialized,
    forceSyncUserData,
  };
};
