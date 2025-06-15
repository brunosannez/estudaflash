
import { supabase } from "@/integrations/supabase/client";
import { calculateLevel } from "@/utils/gamificationUtils";

export class HistoricalCalculationService {
  // Calcular progresso baseado em dados históricos
  static async calculateHistoricalProgress(userId: string) {
    try {
      console.log('📊 Calculating historical progress for:', userId);
      
      // Buscar todas as atividades históricas
      const [flashcardReviews, quizAnswers, quizSessions] = await Promise.all([
        supabase.from('flashcard_reviews').select('*').eq('user_id', userId),
        supabase.from('quiz_respostas').select('*').eq('user_id', userId),
        supabase.from('quiz_sessions').select('*').eq('user_id', userId)
      ]);

      let totalXp = 0;
      
      // XP dos flashcards (5 XP cada)
      const flashcardCount = flashcardReviews.data?.length || 0;
      totalXp += flashcardCount * 5;
      
      // XP dos quizzes
      const quizCount = quizAnswers.data?.length || 0;
      const correctAnswers = quizAnswers.data?.filter(a => a.acertou).length || 0;
      totalXp += correctAnswers * 10; // 10 XP por resposta correta
      totalXp += (quizCount - correctAnswers) * 2; // 2 XP por tentativa
      
      // XP de bônus das sessões completas
      if (quizSessions.data) {
        quizSessions.data.forEach(session => {
          const accuracy = (session.correct_answers / session.total_questions) * 100;
          if (accuracy === 100) totalXp += 50;
          else if (accuracy >= 80) totalXp += 25;
          else if (accuracy >= 60) totalXp += 10;
        });
      }
      
      // Calcular nível
      const level = calculateLevel(totalXp);
      
      // Calcular streak baseado em atividades reais
      const streak = await this.calculateRealStreak(userId);
      
      console.log('📊 Historical progress calculated:', {
        totalXp,
        level,
        flashcardCount,
        quizCount,
        correctAnswers,
        streak
      });
      
      return {
        totalXp,
        level,
        streak
      };
    } catch (error) {
      console.error('❌ Error calculating historical progress:', error);
      return {
        totalXp: 0,
        level: 1,
        streak: { current: 0, longest: 0, lastActivity: null }
      };
    }
  }

  // Calcular streak real baseado em atividades
  static async calculateRealStreak(userId: string) {
    try {
      // Buscar todas as datas com atividades
      const [flashcardDates, quizDates] = await Promise.all([
        supabase
          .from('flashcard_reviews')
          .select('data_review')
          .eq('user_id', userId),
        supabase
          .from('quiz_respostas')
          .select('data_resposta')
          .eq('user_id', userId)
      ]);

      const activityDates = new Set<string>();
      
      flashcardDates.data?.forEach(review => {
        activityDates.add(review.data_review.split('T')[0]);
      });
      
      quizDates.data?.forEach(answer => {
        activityDates.add(answer.data_resposta.split('T')[0]);
      });

      const sortedDates = Array.from(activityDates).sort().reverse();
      
      if (sortedDates.length === 0) {
        return { current: 0, longest: 0, lastActivity: null };
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calcular streak atual (dias consecutivos até hoje)
      for (let i = 0; i < sortedDates.length; i++) {
        const date = sortedDates[i];
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (date === expectedDateStr) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calcular maior streak histórico
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const currentDate = new Date(sortedDates[i]);
          const prevDate = new Date(sortedDates[i - 1]);
          const diffDays = Math.abs((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        current: currentStreak,
        longest: longestStreak,
        lastActivity: sortedDates[0] || null
      };
    } catch (error) {
      console.error('❌ Erro ao calcular streak real:', error);
      return { current: 0, longest: 0, lastActivity: null };
    }
  }
}
