
import { UsageDataService, type UsageData } from './usageDataService';
import { UsageLimitsConfig, type ActionType } from './usageLimitsConfig';
import { PlanType } from '@/types/plans';

export interface UsageValidationResult {
  canProceed: boolean;
  currentUsage: number;
  limit: number;
  plan: PlanType;
  isNearLimit: boolean;
}

export class UsageValidationService {
  static async checkLimit(userId: string, actionType: ActionType): Promise<UsageValidationResult> {
    try {
      const usage = await UsageDataService.getUserUsage(userId);
      if (!usage) {
        throw new Error('Não foi possível obter dados de uso');
      }

      const plan = usage.plano as PlanType;
      const limits = UsageLimitsConfig.getLimits(plan);
      
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
}
