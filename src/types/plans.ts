
export type PlanType = 'free' | 'pro' | 'edu';

export interface PlanConfig {
  name: string;
  displayName: string;
  uploads: number;
  flashcards: number;
  quizzes: number;
  color: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'free',
    displayName: 'FREE',
    uploads: 10,
    flashcards: 10,
    quizzes: 10,
    color: 'text-gray-600',
    badgeVariant: 'secondary',
  },
  pro: {
    name: 'pro',
    displayName: 'PRO',
    uploads: 100,
    flashcards: 100,
    quizzes: 100,
    color: 'text-blue-600',
    badgeVariant: 'default',
  },
  edu: {
    name: 'edu',
    displayName: 'EDU',
    uploads: Infinity,
    flashcards: Infinity,
    quizzes: Infinity,
    color: 'text-green-600',
    badgeVariant: 'outline',
  },
} as const;
