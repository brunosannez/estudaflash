import { supabase } from '@/integrations/supabase/client';

export interface ActionCreditsConfig {
  id: string;
  action_type: string;
  credits_per_action: number;
  ai_provider: string;
  ai_model: string;
  estimated_tokens: number;
  cost_per_1k_tokens_usd: number;
  profit_margin_percentage: number;
}

export interface CreditsUsageLog {
  id: string;
  user_id: string;
  action_type: string;
  credits_consumed: number;
  credits_remaining_after: number;
  metadata: any;
  created_at: string;
}

export interface CreditsConsumptionResult {
  success: boolean;
  credits_consumed: number;
  credits_remaining: number;
  message: string;
}

export class CreditsService {
  /**
   * Verifica se o usuário tem créditos suficientes para uma ação
   */
  static async checkCreditsForAction(
    userId: string, 
    actionType: string
  ): Promise<{ canProceed: boolean; creditsRequired: number; creditsAvailable: number; message: string }> {
    try {
      // Buscar configuração da ação
      const { data: config, error: configError } = await supabase
        .from('action_credits_config')
        .select('credits_per_action')
        .eq('action_type', actionType)
        .single();

      if (configError || !config) {
        console.error('Erro ao buscar configuração de créditos:', configError);
        return {
          canProceed: false,
          creditsRequired: 0,
          creditsAvailable: 0,
          message: 'Configuração de créditos não encontrada'
        };
      }

      // Buscar créditos do usuário
      const { data: user, error: userError } = await supabase
        .from('uso_usuarios')
        .select('credits_remaining')
        .eq('user_id', userId)
        .single();

      if (userError || !user) {
        console.error('Erro ao buscar créditos do usuário:', userError);
        return {
          canProceed: false,
          creditsRequired: config.credits_per_action,
          creditsAvailable: 0,
          message: 'Usuário não encontrado'
        };
      }

      const canProceed = user.credits_remaining >= config.credits_per_action;

      return {
        canProceed,
        creditsRequired: config.credits_per_action,
        creditsAvailable: user.credits_remaining,
        message: canProceed ? 'Créditos suficientes' : 'Créditos insuficientes'
      };

    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      return {
        canProceed: false,
        creditsRequired: 0,
        creditsAvailable: 0,
        message: 'Erro interno ao verificar créditos'
      };
    }
  }

  /**
   * Consome créditos para uma ação usando função do banco
   */
  static async consumeCredits(
    userId: string,
    actionType: string,
    metadata?: any
  ): Promise<CreditsConsumptionResult> {
    try {
      const { data, error } = await supabase.rpc('consume_credits', {
        target_user_id: userId,
        action_type: actionType
      });

      if (error) {
        console.error('Erro ao consumir créditos:', error);
        return {
          success: false,
          credits_consumed: 0,
          credits_remaining: 0,
          message: error.message || 'Erro ao consumir créditos'
        };
      }

      const result = data[0] as CreditsConsumptionResult;

      // Log do consumo de créditos
      if (result.success) {
        await this.logCreditsUsage(userId, actionType, result.credits_consumed, result.credits_remaining, metadata);
      }

      return result;

    } catch (error) {
      console.error('Erro ao consumir créditos:', error);
      return {
        success: false,
        credits_consumed: 0,
        credits_remaining: 0,
        message: 'Erro interno ao consumir créditos'
      };
    }
  }

  /**
   * Registra log de uso de créditos
   */
  static async logCreditsUsage(
    userId: string,
    actionType: string,
    creditsConsumed: number,
    creditsRemainingAfter: number,
    metadata?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('credits_usage_log')
        .insert({
          user_id: userId,
          action_type: actionType,
          credits_consumed: creditsConsumed,
          credits_remaining_after: creditsRemainingAfter,
          metadata: metadata || {}
        });

      if (error) {
        console.error('Erro ao registrar log de créditos:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao registrar log de créditos:', error);
      return false;
    }
  }

  /**
   * Busca configurações de créditos para todas as ações
   */
  static async getCreditsConfig(): Promise<ActionCreditsConfig[]> {
    try {
      const { data, error } = await supabase
        .from('action_credits_config')
        .select('*')
        .order('action_type');

      if (error) {
        console.error('Erro ao buscar configuração de créditos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar configuração de créditos:', error);
      return [];
    }
  }

  /**
   * Busca histórico de uso de créditos do usuário
   */
  static async getUserCreditsHistory(
    userId: string,
    limit: number = 50
  ): Promise<CreditsUsageLog[]> {
    try {
      const { data, error } = await supabase
        .from('credits_usage_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar histórico de créditos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de créditos:', error);
      return [];
    }
  }

  /**
   * Calcula estimativa de uso baseado em créditos por ação
   */
  static calculateUsageEstimate(credits: number, config: ActionCreditsConfig[]): Record<string, number> {
    const estimates: Record<string, number> = {};
    
    config.forEach(item => {
      if (item.credits_per_action > 0) {
        estimates[item.action_type] = Math.floor(credits / item.credits_per_action);
      }
    });

    return estimates;
  }

  /**
   * Formata mensagem de créditos para exibição ao usuário
   */
  static formatCreditsMessage(
    actionType: string,
    creditsRequired: number,
    creditsAvailable: number,
    canProceed: boolean
  ): string {
    const actionNames: Record<string, string> = {
      ocr: 'processamento de imagem',
      summary: 'geração de resumo',
      flashcards: 'criação de flashcards',
      quiz: 'geração de quiz'
    };

    const actionName = actionNames[actionType] || actionType;

    if (canProceed) {
      return `${creditsRequired} crédito(s) serão consumidos para ${actionName}. Você possui ${creditsAvailable} crédito(s) disponíveis.`;
    } else {
      return `Créditos insuficientes! Você precisa de ${creditsRequired} crédito(s) para ${actionName}, mas possui apenas ${creditsAvailable}.`;
    }
  }
}