
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSyncManager = () => {
  const [syncing, setSyncing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  const forceSyncUserData = async (userId: string) => {
    if (!userId) {
      console.log('❌ Usuário não autenticado');
      return false;
    }

    setSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização forçada para:', userId);

      // Verificar se já existe registro do usuário
      const { data: existingUsage, error: fetchError } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Erro ao buscar uso atual:', fetchError);
        throw fetchError;
      }

      if (!existingUsage) {
        console.log('📝 Criando novo registro de uso...');
        
        // Get Free plan ID
        const { data: freePlan } = await supabase
          .from('plans')
          .select('id, credits_per_month')
          .eq('name', 'Free')
          .single();

        const { error: insertError } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: userId,
            plan_id: freePlan?.id || '',
            uploads_realizados: 0,
            flashcards_gerados: 0,
            quizzes_realizados: 0,
            plano: 'free',
            credits_remaining: freePlan?.credits_per_month || 50,
            credits_used_this_month: 0,
            last_credits_reset: new Date().toISOString().split('T')[0]
          });

        if (insertError) {
          console.error('❌ Erro ao criar registro:', insertError);
          throw insertError;
        }
      }

      console.log('✅ Sincronização completa!');
      
      toast({
        title: "✅ Dados Sincronizados!",
        description: "Seus dados foram atualizados com sucesso.",
        duration: 3000,
      });

      setHasInitialized(true);
      return true;

    } catch (error) {
      console.error('❌ Erro crítico na sincronização:', error);
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
