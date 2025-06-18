
export type ActionType = 'uploads' | 'summaries' | 'flashcards' | 'quizzes';

export const USAGE_LIMITS = {
  free: {
    uploads: 10,
    summaries: 10,
    flashcards: 10,
    quizzes: 10,
  },
  pro: {
    uploads: 100,
    summaries: 100,
    flashcards: 100,
    quizzes: 100,
  },
  edu: {
    uploads: Infinity,
    summaries: Infinity,
    flashcards: Infinity,
    quizzes: Infinity,
  },
} as const;

export class UsageLimitsConfig {
  static getLimitMessage(actionType: ActionType, plan: string): string {
    const actionNames = {
      uploads: 'uploads',
      summaries: 'resumos',
      flashcards: 'flashcards',
      quizzes: 'quizzes',
    };
    
    return `Você atingiu o limite de ${actionNames[actionType]} do plano ${plan.toUpperCase()}.`;
  }

  static getUpgradeMessage(plan: string): string {
    if (plan === 'free') {
      return 'Faça upgrade para PRO ou EDU para continuar!';
    }
    return 'Considere fazer upgrade para o plano EDU para recursos ilimitados!';
  }
}
