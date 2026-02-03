import { PlanType } from '@/types/plans';

export interface AIModelConfig {
  summaryModel: {
    provider: 'anthropic';
    model: string;
  };
  flashcardModel: {
    provider: 'anthropic';
    model: string;
  };
  quizModel: {
    provider: 'anthropic';
    model: string;
  };
}

export class AIModelService {
  static getModelConfigForPlan(plan: PlanType): AIModelConfig {
    // Configuração otimizada usando apenas Anthropic
    // Claude Sonnet 4 para tarefas de alta qualidade (resumos, quiz)
    // Claude 3 Haiku para tarefas de custo-benefício (flashcards)
    switch (plan) {
      case 'free':
        return {
          summaryModel: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-20250514'
          },
          flashcardModel: {
            provider: 'anthropic',
            model: 'claude-3-haiku-20240307'
          },
          quizModel: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-20250514'
          }
        };

      case 'pro':
        return {
          summaryModel: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-20250514'
          },
          flashcardModel: {
            provider: 'anthropic',
            model: 'claude-3-haiku-20240307'
          },
          quizModel: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-20250514'
          }
        };

      case 'edu':
        return {
          summaryModel: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-20250514'
          },
          flashcardModel: {
            provider: 'anthropic',
            model: 'claude-3-haiku-20240307'
          },
          quizModel: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-20250514'
          }
        };

      default:
        return this.getModelConfigForPlan('free');
    }
  }

  static getProviderDisplayName(provider: string): string {
    switch (provider) {
      case 'anthropic':
        return 'Claude (Anthropic)';
      default:
        return provider;
    }
  }

  static getModelDisplayName(model: string): string {
    switch (model) {
      case 'claude-sonnet-4-20250514':
        return 'Claude Sonnet 4';
      case 'claude-3-haiku-20240307':
        return 'Claude 3 Haiku';
      default:
        return model;
    }
  }
}
