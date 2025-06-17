
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlanLimits {
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
  quizzes_limit: number;
}

export interface UserUsage {
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  plan_limits: PlanLimits;
  plan_name: string;
}

export type ActionType = 'upload' | 'summary' | 'flashcard' | 'quiz';

export class PlanLimitService {
  static async checkUserLimits(userId: string): Promise<UserUsage | null> {
    try {
      const { data, error } = await supabase
        .from('uso_usuarios')
        .select(`
          uploads_realizados,
          flashcards_gerados,
          quizzes_realizados,
          plans:plan_id (
            name,
            uploads_limit,
            summaries_limit,
            flashcards_limit,
            quizzes_limit
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar limites do usuário:', error);
        return null;
      }

      const planData = data.plans as any;
      
      return {
        uploads_realizados: data.uploads_realizados,
        flashcards_gerados: data.flashcards_gerados,
        quizzes_realizados: data.quizzes_realizados,
        plan_limits: {
          uploads_limit: planData.uploads_limit,
          summaries_limit: planData.summaries_limit,
          flashcards_limit: planData.flashcards_limit,
          quizzes_limit: planData.quizzes_limit
        },
        plan_name: planData.name
      };
    } catch (error) {
      console.error('💥 Erro ao verificar limites:', error);
      return null;
    }
  }

  static async canPerformAction(userId: string, actionType: ActionType): Promise<{
    canProceed: boolean;
    usage: UserUsage | null;
    message?: string;
  }> {
    const usage = await this.checkUserLimits(userId);
    
    if (!usage) {
      return {
        canProceed: false,
        usage: null,
        message: 'Erro ao verificar limites do plano'
      };
    }

    let currentUsage: number;
    let limit: number;
    let actionName: string;

    switch (actionType) {
      case 'upload':
        currentUsage = usage.uploads_realizados;
        limit = usage.plan_limits.uploads_limit;
        actionName = 'uploads';
        break;
      case 'summary':
        currentUsage = usage.uploads_realizados; // Resumos são baseados em uploads
        limit = usage.plan_limits.summaries_limit;
        actionName = 'resumos';
        break;
      case 'flashcard':
        currentUsage = usage.flashcards_gerados;
        limit = usage.plan_limits.flashcards_limit;
        actionName = 'flashcards';
        break;
      case 'quiz':
        currentUsage = usage.quizzes_realizados;
        limit = usage.plan_limits.quizzes_limit;
        actionName = 'quizzes';
        break;
      default:
        return {
          canProceed: false,
          usage,
          message: 'Tipo de ação inválida'
        };
    }

    // -1 significa ilimitado
    if (limit === -1) {
      return {
        canProceed: true,
        usage
      };
    }

    const canProceed = currentUsage < limit;
    
    if (!canProceed) {
      return {
        canProceed: false,
        usage,
        message: `Você atingiu o limite de ${limit} ${actionName} do plano ${usage.plan_name}. Faça upgrade para continuar!`
      };
    }

    return {
      canProceed: true,
      usage
    };
  }

  static async incrementUsage(userId: string, actionType: ActionType): Promise<boolean> {
    try {
      const fieldMap: Record<ActionType, string> = {
        upload: 'uploads_realizados',
        summary: 'uploads_realizados', // Resumos incrementam uploads
        flashcard: 'flashcards_gerados',
        quiz: 'quizzes_realizados'
      };

      const field = fieldMap[actionType];
      
      const { error } = await supabase.rpc('increment_user_usage', {
        user_id: userId,
        field_name: field
      });

      if (error) {
        console.error('❌ Erro ao incrementar uso:', error);
        return false;
      }

      console.log(`✅ Uso incrementado: ${actionType}`);
      return true;
    } catch (error) {
      console.error('💥 Erro ao incrementar uso:', error);
      return false;
    }
  }
}
