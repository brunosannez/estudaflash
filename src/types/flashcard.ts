export interface EnhancedFlashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string | null;
  category?: string | null;
  tags: string[];
  difficulty: number; // 1-5
  repetition_count: number;
  ef_factor: number; // Ease Factor para spaced repetition
  next_review_date: string;
  last_reviewed_at?: string | null;
  is_favorite: boolean;
  data_criacao: string;
  resumo_id: string;
}

export interface FlashcardCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface FlashcardReview {
  id: string;
  flashcard_id: string;
  user_id: string;
  lembrou: boolean;
  difficulty_rating?: number; // 1-5
  response_time_ms?: number;
  review_quality?: number; // 0-5 (SM-2 algorithm)
  notes?: string | null;
  data_review: string;
}

export interface FlashcardStudyStats {
  id: string;
  user_id: string;
  category?: string | null;
  study_date: string;
  cards_reviewed: number;
  cards_remembered: number;
  total_study_time_minutes: number;
  average_response_time_ms: number;
  streak_count: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardStudyGoal {
  id: string;
  user_id: string;
  goal_type: string; // Will be 'daily_cards' | 'weekly_cards' | 'daily_time' | 'weekly_time' | 'category_mastery' in practice
  target_value: number;
  current_progress: number;
  category?: string | null;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpacedRepetitionResult {
  next_date: string;
  new_ef_factor: number;
  new_repetition_count: number;
}

export interface FlashcardDueForReview {
  flashcard_id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string | null;
  category?: string | null;
  difficulty: number;
  next_review_date: string;
  days_overdue: number;
}

export interface StudySession {
  sessionId: string;
  startTime: Date;
  cards: EnhancedFlashcard[];
  currentIndex: number;
  responses: Array<{
    flashcardId: string;
    remembered: boolean;
    responseTime: number;
    quality: number;
  }>;
  stats: {
    totalCards: number;
    reviewedCards: number;
    correctAnswers: number;
    totalTime: number;
    xpEarned: number;
  };
}

export type StudyMode = 'spaced_repetition' | 'category' | 'favorites' | 'random' | 'difficulty';

export interface StudyModeConfig {
  mode: StudyMode;
  category?: string;
  difficulty?: number;
  maxCards?: number;
  includeOverdue?: boolean;
}