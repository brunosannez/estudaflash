
import { PlanType } from '@/types/plans';

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

export class UsageLimitsConfig {
  static getLimits(plan: PlanType) {
    return USAGE_LIMITS[plan] || USAGE_LIMITS.free;
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
