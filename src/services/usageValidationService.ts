
import { UsageDataService, type UsageData } from './usageDataService';
import type { ActionType } from './usageLimitsConfig';

export interface UsageValidationResult {
  canProceed: boolean;
  currentUsage: number;
  limit: number;
  plan: string;
  isNearLimit: boolean;
}

export class UsageValidationService {
  static async checkLimit(userId: string, actionType: ActionType): Promise<UsageValidationResult> {
    try {
      const usage = await UsageDataService.getUserUsage(userId);
      if (!usage) {
        throw new Error('Não foi possível obter dados de uso');
      }

      const currentUsage = this.getCurrentUsageByType(usage, actionType);
      const limit = this.getLimitByType(usage, actionType);
      
      const canProceed = limit === -1 || currentUsage < limit;
      const isNearLimit = limit !== -1 && limit !== Infinity && currentUsage >= limit * 0.9;

      console.log(`🔍 Verificação de limite - ${actionType}:`, {
        currentUsage,
        limit,
        canProceed,
        plan: usage.plan_name || usage.plano,
        isNearLimit
      });

      return {
        canProceed,
        currentUsage,
        limit: limit === Infinity ? -1 : limit,
        plan: usage.plan_name || usage.plano || 'free',
        isNearLimit,
      };
    } catch (error) {
      console.error('❌ Erro ao verificar limite:', error);
      throw error;
    }
  }

  private static getCurrentUsageByType(usage: UsageData, actionType: ActionType): number {
    switch (actionType) {
      case 'uploads':
        return usage.uploads_realizados;
      case 'summaries':
        return usage.uploads_realizados;
      case 'flashcards':
        return usage.flashcards_gerados;
      case 'quizzes':
        return usage.quizzes_realizados;
      default:
        return 0;
    }
  }

  private static getLimitByType(usage: UsageData, actionType: ActionType): number {
    switch (actionType) {
      case 'uploads':
        return usage.uploads_limit || 10;
      case 'summaries':
        return usage.summaries_limit || 10;
      case 'flashcards':
        return usage.flashcards_limit || 10;
      case 'quizzes':
        return usage.quizzes_limit || 10;
      default:
        return 10;
    }
  }
}
