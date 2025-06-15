
export interface Plan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  price_brl_yearly: number;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: integer;
  quizzes_limit: number;
  quiz_model: string;
  summary_model: string;
  flashcard_model: string;
  features: string[];
  is_active: boolean;
  is_editable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  amount_paid_brl: number;
  payment_method?: string;
  start_date: string;
  renewal_date?: string;
  status: 'active' | 'canceled' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface UserPlanDetails {
  plan_name: string;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
  quizzes_limit: number;
  quiz_model: string;
  summary_model: string;
  flashcard_model: string;
}

export type PlanType = 'free' | 'pro' | 'edu';

export const PLAN_CONFIGS = {
  free: {
    displayName: 'Gratuito',
    uploads: 10,
    flashcards: 10,
    quizzes: 10,
    color: 'text-gray-600',
    badgeVariant: 'secondary' as const,
  },
  pro: {
    displayName: 'Professional',
    uploads: 100,
    flashcards: 100,
    quizzes: 100,
    color: 'text-blue-600',
    badgeVariant: 'default' as const,
  },
  edu: {
    displayName: 'Educacional',
    uploads: Infinity,
    flashcards: Infinity,
    quizzes: Infinity,
    color: 'text-green-600',
    badgeVariant: 'default' as const,
  },
} as const;

export const AI_MODELS = {
  quiz: ['GPT-3.5', 'GPT-4o', 'Claude 3'],
  summary: ['Claude 3', 'Claude 3.5', 'GPT-4o'],
  flashcard: ['DeepSeek-V2', 'GPT-3.5', 'Claude 3']
} as const;
