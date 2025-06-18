
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UsageLimitService, type UsageData } from '@/services/usageLimitService';
import { supabase } from '@/integrations/supabase/client';

export const useUsageData = () => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageData = async () => {
    if (!user) {
      console.log('👤 Usuário não autenticado');
      setUsageData(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔍 Buscando dados de uso para usuário:', user.id);
      
      const data = await UsageLimitService.getUserUsage(user.id);
      
      if (data) {
        console.log('📊 Dados de uso carregados:', data);
        setUsageData(data);
      } else {
        console.warn('⚠️ Nenhum dado de uso encontrado, inicializando...');
        const initializedData = await UsageLimitService.initializeUserUsage(user.id);
        if (initializedData) {
          setUsageData(initializedData);
          console.log('✅ Dados de uso inicializados:', initializedData);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados de uso:', error);
      
      // Fallback data
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🚀 Carregando dados de uso...');
      fetchUsageData();
    }
  }, [user]);

  // Simplified realtime listener without conflicts
  useEffect(() => {
    if (!user) return;

    console.log('👂 Configurando listener simples para mudanças...');
    
    const channel = supabase
      .channel(`usage-simple-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uso_usuarios',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🔄 Dados alterados, recarregando...');
          setTimeout(() => fetchUsageData(), 500);
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Removendo listener...');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const manualRefresh = async () => {
    console.log('🔄 Atualização manual solicitada...');
    await fetchUsageData();
  };

  return {
    usageData,
    loading,
    refreshUsage: manualRefresh,
    fetchUsageData,
  };
};
