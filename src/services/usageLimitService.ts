
import { supabase } from '@/integrations/supabase/client';

export interface UsageData {
  id: string;
  user_id: string;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  data_ultimo_reset: string;
  plano: string;
}

export const USAGE_LIMITS = {
  free: {
    uploads: 10,
    flashcards: 10,
    quizzes: 10,
  },
  premium: {
    uploads: Infinity,
    flashcards: Infinity,
    quizzes: Infinity,
  },
} as const;

export type ActionType = 'uploads' | 'flashcards' | 'quizzes';

export class UsageLimitService {
  static async getUserUsage(userId: string): Promise<UsageData | null> {
    try {
      console.log('🔍 Buscando dados de uso para usuário:', userId);
      
      const { data, error } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar dados de uso:', error);
        throw error;
      }

      if (!data) {
        console.log('📝 Criando registro inicial de uso para usuário:', userId);
        return await this.initializeUserUsage(userId);
      }

      console.log('✅ Dados de uso encontrados:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no getUserUsage:', error);
      throw error;
    }
  }

  static async initializeUserUsage(userId: string): Promise<UsageData> {
    try {
      const { data, error } = await supabase
        .from('uso_usuarios')
        .insert({
          user_id: userId,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
          plano: 'free',
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inicializar uso do usuário:', error);
        throw error;
      }

      console.log('✅ Registro de uso inicializado:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no initializeUserUsage:', error);
      throw error;
    }
  }

  static async checkLimit(userId: string, actionType: ActionType): Promise<{
    canProceed: boolean;
    currentUsage: number;
    limit: number;
    plan: string;
  }> {
    try {
      const usage = await this.getUserUsage(userId);
      if (!usage) {
        throw new Error('Não foi possível obter dados de uso');
      }

      const plan = usage.plano as keyof typeof USAGE_LIMITS;
      const limits = USAGE_LIMITS[plan] || USAGE_LIMITS.free;
      
      const currentUsage = this.getCurrentUsageByType(usage, actionType);
      const limit = limits[actionType];
      
      const canProceed = currentUsage < limit;

      console.log(`🔍 Verificação de limite - ${actionType}:`, {
        currentUsage,
        limit,
        canProceed,
        plan: usage.plano
      });

      return {
        canProceed,
        currentUsage,
        limit: limit === Infinity ? -1 : limit,
        plan: usage.plano,
      };
    } catch (error) {
      console.error('❌ Erro ao verificar limite:', error);
      throw error;
    }
  }

  static async incrementUsage(userId: string, actionType: ActionType): Promise<void> {
    try {
      console.log(`📈 Incrementando uso - ${actionType} para usuário:`, userId);
      
      const fieldMap = {
        uploads: 'uploads_realizados',
        flashcards: 'flashcards_gerados',
        quizzes: 'quizzes_realizados',
      };

      const field = fieldMap[actionType];
      
      const { error } = await supabase.rpc('increment_usage_counter', {
        p_user_id: userId,
        p_field: field,
      });

      if (error) {
        console.error('❌ Erro ao incrementar uso:', error);
        // Fallback para update manual se a função RPC não existir
        const { error: updateError } = await supabase
          .from('uso_usuarios')
          .update({
            [field]: supabase.sql`${field} + 1`,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ Erro no fallback de incremento:', updateError);
          throw updateError;
        }
      }

      console.log(`✅ Uso incrementado com sucesso - ${actionType}`);
    } catch (error) {
      console.error('❌ Erro no incrementUsage:', error);
      throw error;
    }
  }

  private static getCurrentUsageByType(usage: UsageData, actionType: ActionType): number {
    switch (actionType) {
      case 'uploads':
        return usage.uploads_realizados;
      case 'flashcards':
        return usage.flashcards_gerados;
      case 'quizzes':
        return usage.quizzes_realizados;
      default:
        return 0;
    }
  }

  static getLimitMessage(actionType: ActionType): string {
    const messages = {
      uploads: 'Você atingiu o limite de uploads do plano gratuito. Faça upgrade para continuar.',
      flashcards: 'Você atingiu o limite de flashcards do plano gratuito. Faça upgrade para continuar.',
      quizzes: 'Você atingiu o limite de quizzes do plano gratuito. Faça upgrade para continuar.',
    };
    
    return messages[actionType];
  }
}
