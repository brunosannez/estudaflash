
import { UsageDataService, type UsageData } from './usageDataService';

export interface UsageValidationResult {
  canProceed: boolean;
  currentUsage: number;
  limit: number;
  plan: string;
  isNearLimit: boolean;
}

export class UsageValidationService {
  static async checkLimit(userId: string, actionType: 'uploads' | 'summaries' | 'flashcards' | 'quizzes'): Promise<UsageValidationResult> {
    try {
      const usage = await UsageDataService.getUserUsage(userId);
      if (!usage) {
        throw new Error('Não foi possível obter dados de uso');
      }

      const currentUsage = this.getCurrentUsageByType(usage, actionType);
      const limit = this.getLimitByType(usage, actionType);
      
      const canProceed = currentUsage < limit;
      const isNearLimit = limit !== Infinity && currentUsage >= limit * 0.9;

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

  private static getCurrentUsageByType(usage: UsageData, actionType: 'uploads' | 'summaries' | 'flashcards' | 'quizzes'): number {
    switch (actionType) {
      case 'uploads':
        return usage.uploads_realizados;
      case 'summaries':
        return usage.uploads_realizados; // Summaries are tied to uploads
      case 'flashcards':
        return usage.flashcards_gerados;
      case 'quizzes':
        return usage.quizzes_realizados;
      default:
        return 0;
    }
  }

  private static getLimitByType(usage: UsageData, actionType: 'uploads' | 'summaries' | 'flashcards' | 'quizzes'): number {
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
