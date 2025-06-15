
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageLimitService, type UsageData } from '@/services/usageLimitService';
import { supabase } from '@/integrations/supabase/client';
import { useDataSync } from '@/hooks/useDataSync';

export const useUsageData = () => {
  const { user } = useAuth();
  const { forceSyncUserData, syncing: syncingData, hasInitialized } = useDataSync();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchUsageData = async (skipSync = false) => {
    if (!user) {
      console.log('👤 Usuário não autenticado');
      setUsageData(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Buscando dados de uso para usuário:', user.id);
      
      // Sempre sincronizar primeiro na inicialização ou quando solicitado
      if (!skipSync && hasInitialized) {
        console.log('🔄 Forçando sincronização antes de buscar dados...');
        await forceSyncUserData();
      }
      
      // Buscar dados atualizados
      const data = await UsageLimitService.getUserUsage(user.id);
      
      if (data) {
        console.log('📊 Dados de uso carregados com sucesso:', data);
        setUsageData(data);
        setRetryCount(0);
      } else {
        console.warn('⚠️ Nenhum dado de uso encontrado, inicializando...');
        
        // Tentar inicializar dados do usuário
        const initializedData = await UsageLimitService.initializeUserUsage(user.id);
        if (initializedData) {
          setUsageData(initializedData);
          console.log('✅ Dados de uso inicializados:', initializedData);
        } else {
          throw new Error('Falha ao inicializar dados do usuário');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados de uso:', error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries} em 2 segundos...`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          fetchUsageData(true); // Skip sync on retry to avoid loops
        }, 2000);
      } else {
        console.error('❌ Falha após múltiplas tentativas');
        setRetryCount(0);
        
        // Provide fallback data
        const fallbackData: UsageData = {
          id: '',
          user_id: user.id,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
          data_ultimo_reset: new Date().toISOString(),
          plano: 'free',
          plan_id: '',
          plan_name: 'Free',
          uploads_limit: 10,
          summaries_limit: 10,
          flashcards_limit: 10,
          quizzes_limit: 10,
          quiz_model: 'GPT-3.5',
          summary_model: 'Claude 3',
          flashcard_model: 'DeepSeek-V2',
        };
        
        console.log('📋 Usando dados de fallback:', fallbackData);
        setUsageData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o usuário está disponível
  useEffect(() => {
    if (user && hasInitialized) {
      console.log('🚀 Carregando dados de uso...');
      fetchUsageData();
    }
  }, [user, hasInitialized]);

  // Listener para mudanças na tabela uso_usuarios
  useEffect(() => {
    if (!user) return;

    console.log('👂 Configurando listener para mudanças em tempo real...');
    
    const channel = supabase
      .channel(`usage-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Dados de uso alterados em tempo real:', payload);
          // Usar skipSync para evitar loop infinito
          setTimeout(() => fetchUsageData(true), 1000);
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Removendo listener de tempo real...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const manualRefresh = async () => {
    console.log('🔄 Atualização manual solicitada...');
    setRetryCount(0); // Reset retry count on manual refresh
    await forceSyncUserData();
    await fetchUsageData(true);
  };

  return {
    usageData,
    loading: loading || syncingData,
    refreshUsage: manualRefresh,
    fetchUsageData,
  };
};
