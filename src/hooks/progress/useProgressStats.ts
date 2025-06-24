
import { useCallback } from 'react';
import { GameStats, UserProgress, DailyActivity } from '@/types/gamification';

export const useProgressStats = () => {
  const getStats = useCallback((progress: UserProgress | null, todayActivity: DailyActivity | null): GameStats | null => {
    if (!progress || !todayActivity) return null;

    const nextLevelXp = progress.current_level < 3 ? 
      (progress.current_level === 1 ? 50 : 150) : 
      300 + (progress.current_level - 3) * 200;

    const currentLevelMinXp = progress.current_level === 1 ? 0 :
      progress.current_level === 2 ? 50 :
      progress.current_level === 3 ? 150 :
      300 + (progress.current_level - 4) * 200;

    const xpProgress = Math.min(100, Math.max(0, 
      ((progress.total_xp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100
    ));

    return {
      currentLevel: progress.current_level,
      currentXp: progress.total_xp,
      nextLevelXp,
      currentLevelMinXp,
      xpProgress,
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      todayFlashcards: todayActivity.flashcards_reviewed,
      todayQuizzes: todayActivity.quizzes_completed,
      todayCorrectAnswers: todayActivity.quiz_correct_answers,
      todayXp: todayActivity.xp_earned
    };
  }, []);

  return { getStats };
};
