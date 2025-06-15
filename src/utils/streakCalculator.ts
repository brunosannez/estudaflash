
import { supabase } from '@/integrations/supabase/client';

export const calculateRealStreak = async (userId: string) => {
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

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Calcular streak atual (dias consecutivos até hoje ou ontem)
    let checkDate = new Date(today);
    
    // Se não há atividade hoje, começar verificando ontem
    if (!activityDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Verificar dias consecutivos para trás
    for (let i = 0; i < 365; i++) {
      const checkDateStr = checkDate.toISOString().split('T')[0];
      
      if (activityDates.has(checkDateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
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
        const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
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
    console.error('❌ Erro ao calcular streak:', error);
    return { current: 0, longest: 0, lastActivity: null };
  }
};
