import { supabase } from '@/integrations/supabase/client';
import { PlanType, PLAN_CONFIGS } from '@/types/plans';

export interface UsageData {
  id: string;
  user_id: string;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  data_ultimo_reset: string;
  plano: PlanType;
}

export const USAGE_LIMITS = {
  free: {
    uploads: 10,
    flashcards: 10,
    quizzes: 10,
  },
  pro: {
    uploads: 100,
    flashcards: 100,
    quizzes: 100,
  },
  edu: {
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
      // Type casting para PlanType
      return {
        ...data,
        plano: data.plano as PlanType
      };
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
      // Type casting para PlanType
      return {
        ...data,
        plano: data.plano as PlanType
      };
    } catch (error) {
      console.error('❌ Erro no initializeUserUsage:', error);
      throw error;
    }
  }

  static async checkLimit(userId: string, actionType: ActionType): Promise<{
    canProceed: boolean;
    currentUsage: number;
    limit: number;
    plan: PlanType;
    isNearLimit: boolean;
  }> {
    try {
      const usage = await this.getUserUsage(userId);
      if (!usage) {
        throw new Error('Não foi possível obter dados de uso');
      }

      const plan = usage.plano as PlanType;
      const limits = USAGE_LIMITS[plan] || USAGE_LIMITS.free;
      
      const currentUsage = this.getCurrentUsageByType(usage, actionType);
      const limit = limits[actionType];
      
      const canProceed = currentUsage < limit;
      const isNearLimit = limit !== Infinity && currentUsage >= limit * 0.9;

      console.log(`🔍 Verificação de limite - ${actionType}:`, {
        currentUsage,
        limit,
        canProceed,
        plan: usage.plano,
        isNearLimit
      });

      return {
        canProceed,
        currentUsage,
        limit: limit === Infinity ? -1 : limit,
        plan: usage.plano,
        isNearLimit,
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
      
      const currentUsage = await this.getUserUsage(userId);
      if (!currentUsage) {
        throw new Error('Usuário não encontrado');
      }

      const { error } = await supabase
        .from('uso_usuarios')
        .update({
          [field]: currentUsage[field as keyof UsageData] as number + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao incrementar uso:', error);
        throw error;
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

  static getLimitMessage(actionType: ActionType, plan: PlanType): string {
    const actionNames = {
      uploads: 'uploads',
      flashcards: 'flashcards',
      quizzes: 'quizzes',
    };
    
    const planLimits = USAGE_LIMITS[plan];
    const currentLimit = planLimits[actionType];
    
    if (plan === 'free') {
      return `Você atingiu o limite de ${currentLimit} ${actionNames[actionType]} do plano gratuito.`;
    } else if (plan === 'pro') {
      return `Você atingiu o limite de ${currentLimit} ${actionNames[actionType]} do plano Pro.`;
    } else {
      return `Limite do plano EDU atingido para ${actionNames[actionType]}.`;
    }
  }

  static getUpgradeMessage(plan: PlanType): string {
    if (plan === 'free') {
      return 'Assine o plano Pro para ter 10x mais limite ou EDU para acesso ilimitado!';
    } else if (plan === 'pro') {
      return 'Considere o plano EDU para acesso completamente ilimitado!';
    }
    return '';
  }
}
