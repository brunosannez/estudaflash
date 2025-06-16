
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ApiUsageData {
  id: string;
  api_provider: 'openai' | 'anthropic' | 'huggingface';
  action_type: 'summary' | 'quiz' | 'flashcard' | 'ocr';
  tokens_used: number;
  estimated_cost_usd: number;
  user_id: string;
  timestamp: string;
  model_used: string;
  success: boolean;
  error_message?: string;
}

export interface ApiProviderStats {
  provider: string;
  total_tokens: number;
  total_cost_usd: number;
  requests_count: number;
  success_rate: number;
  last_request: string;
}

export const useApiUsageTracking = () => {
  const [loading, setLoading] = useState(false);
  const [apiStats, setApiStats] = useState<ApiProviderStats[]>([]);

  const logApiUsage = async (data: {
    api_provider: 'openai' | 'anthropic' | 'huggingface';
    action_type: 'summary' | 'quiz' | 'flashcard' | 'ocr';
    tokens_used: number;
    estimated_cost_usd: number;
    model_used: string;
    success: boolean;
    error_message?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('api_usage_tracking')
        .insert({
          ...data,
          user_id: user.id
        });

      if (error) throw error;

      console.log('✅ Uso de API registrado:', data);
      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar uso de API:', error);
      return false;
    }
  };

  const getApiStats = async (timeRange = '7d') => {
    try {
      setLoading(true);
      
      let startDate = new Date();
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const { data, error } = await supabase
        .from('api_usage_tracking')
        .select('*')
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Cast the data to the correct type since we know the database schema
      const typedData = (data || []) as ApiUsageData[];
      
      // Processar dados para estatísticas por provedor
      const stats = processApiStats(typedData);
      setApiStats(stats);

      return typedData;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de API:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const processApiStats = (data: ApiUsageData[]): ApiProviderStats[] => {
    const providers = ['openai', 'anthropic', 'huggingface'];
    
    return providers.map(provider => {
      const providerData = data.filter(item => item.api_provider === provider);
      
      const total_tokens = providerData.reduce((sum, item) => sum + item.tokens_used, 0);
      const total_cost_usd = providerData.reduce((sum, item) => sum + item.estimated_cost_usd, 0);
      const requests_count = providerData.length;
      const successful_requests = providerData.filter(item => item.success).length;
      const success_rate = requests_count > 0 ? (successful_requests / requests_count) * 100 : 0;
      const last_request = providerData.length > 0 
        ? Math.max(...providerData.map(item => new Date(item.timestamp).getTime()))
        : 0;

      return {
        provider,
        total_tokens,
        total_cost_usd,
        requests_count,
        success_rate,
        last_request: last_request > 0 ? new Date(last_request).toISOString() : 'Nunca'
      };
    });
  };

  const getRealTimeStats = async () => {
    try {
      const { data, error } = await supabase
        .from('api_usage_tracking')
        .select('api_provider, tokens_used, estimated_cost_usd')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Create mock full data structures for processing
      const mockData: ApiUsageData[] = (data || []).map(item => ({
        id: '',
        api_provider: item.api_provider as 'openai' | 'anthropic' | 'huggingface',
        action_type: 'summary' as const,
        tokens_used: item.tokens_used,
        estimated_cost_usd: item.estimated_cost_usd,
        user_id: '',
        timestamp: new Date().toISOString(),
        model_used: '',
        success: true
      }));

      return processApiStats(mockData);
    } catch (error) {
      console.error('Erro ao buscar estatísticas em tempo real:', error);
      return [];
    }
  };

  return {
    loading,
    apiStats,
    logApiUsage,
    getApiStats,
    getRealTimeStats
  };
};
