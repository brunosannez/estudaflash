
export interface UserProgress {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  flashcards_reviewed: number;
  quizzes_completed: number;
  quiz_correct_answers: number;
  xp_earned: number;
}

export type ActivityType = 
  | 'flashcard' 
  | 'quiz_correct' 
  | 'quiz_incorrect'
  | 'quiz_perfect'
  | 'quiz_excellent'
  | 'quiz_good'
  | 'quiz_complete';

export interface GameStats {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  currentLevelMinXp: number;
  xpProgress: number;
  currentStreak: number;
  longestStreak: number;
  todayFlashcards: number;
  todayQuizzes: number;
  todayCorrectAnswers: number;
  todayXp: number;
}
