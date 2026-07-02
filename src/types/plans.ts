
export interface Plan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  price_brl_yearly: number;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
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

// Create a separate interface for active plans (public signup)
export interface ActivePlan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  price_brl_yearly: number;
  credits_per_month?: number;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
  quizzes_limit: number;
  quiz_model: string;
  summary_model: string;
  flashcard_model: string;
  features: string[];
}

export type PlanType = 'free' | 'pro' | 'pro max' | 'edu';

// Capacidades derivadas dos créditos mensais (OCR 1cr/img, resumo 8cr,
// flashcards 3cr, quiz 8cr). Exibição legada — a fonte de verdade é o
// sistema de créditos.
export const PLAN_CONFIGS = {
  free: {
    displayName: 'Gratuito',
    credits: 50,
    uploads: 50,
    flashcards: 16,
    quizzes: 6,
    color: 'text-muted-foreground',
    badgeVariant: 'secondary' as const,
  },
  pro: {
    displayName: 'Pro',
    credits: 500,
    uploads: 500,
    flashcards: 166,
    quizzes: 62,
    color: 'text-primary',
    badgeVariant: 'default' as const,
  },
  'pro max': {
    displayName: 'Pro Max',
    credits: 1200,
    uploads: 1200,
    flashcards: 400,
    quizzes: 150,
    color: 'text-brand-orange',
    badgeVariant: 'default' as const,
  },
  edu: {
    displayName: 'Educacional',
    credits: 2000,
    uploads: 2000,
    flashcards: 666,
    quizzes: 250,
    color: 'text-accent',
    badgeVariant: 'default' as const,
  },
} as const;

export const AI_MODELS = {
  quiz: ['Claude Sonnet 5'],
  summary: ['Claude Sonnet 5'],
  flashcard: ['Claude Haiku 4.5']
} as const;
