
import { PlanType } from '@/types/plans';

export interface AIModelConfig {
  summaryModel: {
    provider: 'anthropic' | 'openai';
    model: string;
  };
  flashcardModel: {
    provider: 'huggingface' | 'anthropic';
    model: string;
  };
  quizModel: {
    provider: 'openai' | 'anthropic';
    model: string;
  };
}

export class AIModelService {
  static getModelConfigForPlan(plan: PlanType): AIModelConfig {
    switch (plan) {
      case 'free':
        return {
          summaryModel: {
            provider: 'anthropic',
            model: 'claude-3-5-sonnet-20241022'
          },
          flashcardModel: {
            provider: 'huggingface',
            model: 'deepseek-ai/DeepSeek-V2-Chat'
          },
          quizModel: {
            provider: 'openai',
            model: 'gpt-3.5-turbo'
          }
        };

      case 'pro':
        return {
          summaryModel: {
            provider: 'anthropic',
            model: 'claude-3-5-sonnet-20241022'
          },
          flashcardModel: {
            provider: 'huggingface',
            model: 'deepseek-ai/DeepSeek-V2-Chat'
          },
          quizModel: {
            provider: 'openai',
            model: 'gpt-4o'
          }
        };

      case 'edu':
        return {
          summaryModel: {
            provider: 'anthropic',
            model: 'claude-3-5-sonnet-20241022'
          },
          flashcardModel: {
            provider: 'huggingface',
            model: 'deepseek-ai/DeepSeek-V2-Chat'
          },
          quizModel: {
            provider: 'openai',
            model: 'gpt-4o'
          }
        };

      default:
        // Fallback para plano free
        return this.getModelConfigForPlan('free');
    }
  }

  static getProviderDisplayName(provider: string): string {
    switch (provider) {
      case 'anthropic':
        return 'Claude';
      case 'openai':
        return 'OpenAI';
      case 'huggingface':
        return 'HuggingFace';
      default:
        return provider;
    }
  }

  static getModelDisplayName(model: string): string {
    switch (model) {
      case 'claude-3-5-sonnet-20241022':
        return 'Claude 3.5 Sonnet';
      case 'deepseek-ai/DeepSeek-V2-Chat':
        return 'DeepSeek-V2';
      case 'gpt-3.5-turbo':
        return 'GPT-3.5 Turbo';
      case 'gpt-4o':
        return 'GPT-4o';
      default:
        return model;
    }
  }
}
