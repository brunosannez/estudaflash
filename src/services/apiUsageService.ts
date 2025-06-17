
import { supabase } from '@/integrations/supabase/client';
import { useApiUsageTracking } from '@/hooks/useApiUsageTracking';

export interface ApiUsageRecord {
  api_provider: 'openai' | 'anthropic' | 'huggingface';
  action_type: 'summary' | 'quiz' | 'flashcard' | 'ocr';
  tokens_used: number;
  estimated_cost_usd: number;
  model_used: string;
  success: boolean;
  error_message?: string;
}

export class ApiUsageService {
  static async trackUsage(data: ApiUsageRecord): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('api_usage_tracking')
        .insert({
          ...data,
          user_id: user.id,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
      console.log('✅ Uso de API registrado:', data);
    } catch (error) {
      console.error('❌ Erro ao registrar uso de API:', error);
    }
  }

  static async checkApiCreditsWarning(): Promise<boolean> {
    try {
      // Simulação de verificação de créditos da API
      // Em um cenário real, isso consultaria os créditos reais das APIs
      const totalCostToday = await this.getTodayApiCost();
      const dailyLimit = 100; // USD por dia
      
      return totalCostToday > (dailyLimit * 0.8); // 80% do limite
    } catch (error) {
      console.error('❌ Erro ao verificar créditos da API:', error);
      return false;
    }
  }

  static async getTodayApiCost(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('api_usage_tracking')
        .select('estimated_cost_usd')
        .gte('timestamp', `${today}T00:00:00.000Z`)
        .lt('timestamp', `${today}T23:59:59.999Z`);

      if (error) throw error;

      return data.reduce((total, record) => total + record.estimated_cost_usd, 0);
    } catch (error) {
      console.error('❌ Erro ao calcular custo da API:', error);
      return 0;
    }
  }

  static async getUsageStatsByProvider(days = 7): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('api_usage_tracking')
        .select('*')
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Processar dados por provedor
      const providers = ['openai', 'anthropic', 'huggingface'];
      return providers.map(provider => {
        const providerData = data.filter(item => item.api_provider === provider);
        
        return {
          provider,
          total_requests: providerData.length,
          total_tokens: providerData.reduce((sum, item) => sum + item.tokens_used, 0),
          total_cost: providerData.reduce((sum, item) => sum + item.estimated_cost_usd, 0),
          success_rate: providerData.length > 0 
            ? (providerData.filter(item => item.success).length / providerData.length) * 100 
            : 0
        };
      });
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas por provedor:', error);
      return [];
    }
  }
}
