
export interface Plan {
  id: string;
  name: string;
  price_brl: number;
  price_brl_yearly: number;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
  quizzes_limit: number;
  quiz_model: string;
  summary_model: string;
  flashcard_model: string;
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
