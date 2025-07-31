export interface QuizConfiguration {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  time_limit_minutes: number;
  questions_count: number;
  difficulty_level: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  show_explanations: boolean;
  allow_hints: boolean;
  category_filters: string[];
  created_at: string;
  updated_at: string;
}

export interface EnhancedQuizSession {
  id: string;
  user_id: string;
  resumo_id: string;
  quiz_title: string;
  total_questions: number;
  correct_answers: number;
  current_question_index: number;
  progress_percentage: number;
  completion_time_seconds?: number;
  questions_data: any[];
  status: 'in_progress' | 'completed' | 'abandoned';
  difficulty_level: number;
  time_per_question_seconds: number;
  hints_used: number;
  performance_score: number;
  weak_topics: string[];
  study_recommendations: string[];
  session_type: 'practice' | 'exam' | 'review' | 'challenge';
  tags: string[];
  created_at: string;
  started_at: string;
  last_activity_at: string;
}

export interface EnhancedQuizAttempt {
  id: string;
  user_id: string;
  resumo_id: string;
  quiz_question_id: string;
  session_id: string;
  selected_answer?: number;
  is_correct?: boolean;
  confidence_level: number;
  time_taken_seconds: number;
  hint_used: boolean;
  difficulty_perceived: number;
  explanation_viewed: boolean;
  answered_at: string;
  created_at: string;
}

export interface QuizPerformanceStats {
  id: string;
  user_id: string;
  date: string;
  total_quizzes_attempted: number;
  total_quizzes_completed: number;
  total_questions_answered: number;
  total_correct_answers: number;
  average_accuracy: number;
  average_time_per_question: number;
  fastest_completion_time: number;
  longest_streak: number;
  current_streak: number;
  topics_mastered: string[];
  topics_struggling: string[];
  xp_earned_from_quizzes: number;
  created_at: string;
  updated_at: string;
}

export interface QuizBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface WeakTopic {
  topic: string;
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  recommendation: string;
}

export interface QuizAnalytics {
  totalQuizzes: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  strongestTopics: string[];
  weakestTopics: WeakTopic[];
  recentPerformance: {
    date: string;
    accuracy: number;
    quizzesCompleted: number;
  }[];
  badges: QuizBadge[];
  streakData: {
    current: number;
    longest: number;
    lastActivity: string;
  };
}

export interface QuizSessionConfig {
  timeLimit?: number;
  questionsCount?: number;
  difficultyLevel?: number;
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  showExplanations?: boolean;
  allowHints?: boolean;
  categoryFilters?: string[];
  sessionType?: 'practice' | 'exam' | 'review' | 'challenge';
}

export interface QuizPerformanceReport {
  sessionId: string;
  overallScore: number;
  accuracy: number;
  timeEfficiency: number;
  difficultyHandling: number;
  weakTopics: WeakTopic[];
  recommendations: string[];
  newBadges: QuizBadge[];
  streakUpdated: boolean;
  xpEarned: number;
}