
import { supabase } from '@/integrations/supabase/client';

export const calculateTodayStats = async (userId: string) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const todayStartStr = todayStart.toISOString();
    const todayEndStr = todayEnd.toISOString();
    
    console.log('📅 Calculating today stats from', todayStartStr, 'to', todayEndStr);
    
    const [todayFlashcards, todayQuizAnswers, todayQuizSessions] = await Promise.all([
      supabase
        .from('flashcard_reviews')
        .select('*')
        .eq('user_id', userId)
        .gte('data_review', todayStartStr)
        .lt('data_review', todayEndStr),
      supabase
        .from('quiz_respostas')
        .select('*')
        .eq('user_id', userId)
        .gte('data_resposta', todayStartStr)
        .lt('data_resposta', todayEndStr),
      supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', todayStartStr)
        .lt('created_at', todayEndStr)
    ]);

    const flashcards = todayFlashcards.data?.length || 0;
    const quizzes = todayQuizAnswers.data?.length || 0;
    const correctAnswers = todayQuizAnswers.data?.filter(a => a.acertou).length || 0;
    
    // Calcular XP de hoje
    let xp = (flashcards * 5) + (correctAnswers * 10) + ((quizzes - correctAnswers) * 2);
    
    // Adicionar bônus de sessões completas
    if (todayQuizSessions.data) {
      todayQuizSessions.data.forEach(session => {
        const accuracy = (session.correct_answers / session.total_questions) * 100;
        if (accuracy === 100) xp += 50;
        else if (accuracy >= 80) xp += 25;
        else if (accuracy >= 60) xp += 10;
      });
    }

    console.log('📊 Today stats calculated:', { flashcards, quizzes, correctAnswers, xp });

    return { flashcards, quizzes, correctAnswers, xp };
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas de hoje:', error);
    return { flashcards: 0, quizzes: 0, correctAnswers: 0, xp: 0 };
  }
};

export const calculateTotalXP = (flashcardReviews: any[], quizAnswers: any[], quizSessions: any[]) => {
  let totalXP = 0;
  let totalFlashcards = 0;
  let totalQuizzes = 0;
  let totalCorrectAnswers = 0;

  // XP dos flashcards (5 XP cada)
  if (flashcardReviews) {
    totalFlashcards = flashcardReviews.length;
    totalXP += totalFlashcards * 5;
  }

  // XP dos quizzes
  if (quizAnswers) {
    totalQuizzes = quizAnswers.length;
    totalCorrectAnswers = quizAnswers.filter(a => a.acertou).length;
    totalXP += totalCorrectAnswers * 10; // 10 XP por resposta correta
    totalXP += (totalQuizzes - totalCorrectAnswers) * 2; // 2 XP por tentativa
  }

  // XP de bônus das sessões completas
  if (quizSessions) {
    quizSessions.forEach(session => {
      const accuracy = (session.correct_answers / session.total_questions) * 100;
      if (accuracy === 100) totalXP += 50;
      else if (accuracy >= 80) totalXP += 25;
      else if (accuracy >= 60) totalXP += 10;
    });
  }

  return {
    totalXP,
    totalFlashcards,
    totalQuizzes,
    totalCorrectAnswers
  };
};

export const calculateLevel = (xp: number): number => {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  return Math.floor((xp - 300) / 200) + 4;
};
