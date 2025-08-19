import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FlashcardSetStats {
  resumo_id: string;
  total_sessions: number;
  completed_sessions: number;
  total_cards_reviewed: number;
  total_correct: number;
  total_incorrect: number;
  accuracy_percentage: number;
  last_studied_at: string | null;
  average_session_time: number;
  best_accuracy: number;
  study_streak: number;
}

export const useFlashcardSetStats = () => {
  const [statsData, setStatsData] = useState<Record<string, FlashcardSetStats>>({});
  const [loading, setLoading] = useState(false);

  const calculateSetStats = async (resumoId: string): Promise<FlashcardSetStats> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar todas as sessões para este resumo
      const { data: sessions, error: sessionsError } = await supabase
        .from('flashcard_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('resumo_id', resumoId)
        .order('created_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        return {
          resumo_id: resumoId,
          total_sessions: 0,
          completed_sessions: 0,
          total_cards_reviewed: 0,
          total_correct: 0,
          total_incorrect: 0,
          accuracy_percentage: 0,
          last_studied_at: null,
          average_session_time: 0,
          best_accuracy: 0,
          study_streak: 0
        };
      }

      // Calcular estatísticas
      const completedSessions = sessions.filter(s => s.status === 'completed');
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalReviewed = 0;
      let bestAccuracy = 0;
      let totalSessionTime = 0;

      sessions.forEach(session => {
        const sessionStats = session.session_stats as any;
        if (sessionStats) {
          totalCorrect += sessionStats.correct || 0;
          totalIncorrect += sessionStats.incorrect || 0;
          totalReviewed += sessionStats.totalReviewed || 0;
          
          // Calcular precisão da sessão
          const sessionTotal = (sessionStats.correct || 0) + (sessionStats.incorrect || 0);
          const sessionAccuracy = sessionTotal > 0 ? ((sessionStats.correct || 0) / sessionTotal) * 100 : 0;
          bestAccuracy = Math.max(bestAccuracy, sessionAccuracy);
        }

        // Estimar tempo da sessão (baseado na atividade)
        if (session.created_at && session.last_activity_at) {
          const sessionDuration = new Date(session.last_activity_at).getTime() - new Date(session.created_at).getTime();
          totalSessionTime += sessionDuration / 1000; // em segundos
        }
      });

      const accuracyPercentage = totalReviewed > 0 ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100 : 0;
      const averageSessionTime = sessions.length > 0 ? totalSessionTime / sessions.length : 0;

      // Calcular streak (sessões consecutivas nas últimas datas)
      const studyStreak = calculateStudyStreak(sessions);

      return {
        resumo_id: resumoId,
        total_sessions: sessions.length,
        completed_sessions: completedSessions.length,
        total_cards_reviewed: totalReviewed,
        total_correct: totalCorrect,
        total_incorrect: totalIncorrect,
        accuracy_percentage: accuracyPercentage,
        last_studied_at: sessions[0]?.last_activity_at || null,
        average_session_time: averageSessionTime,
        best_accuracy: bestAccuracy,
        study_streak: studyStreak
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return {
        resumo_id: resumoId,
        total_sessions: 0,
        completed_sessions: 0,
        total_cards_reviewed: 0,
        total_correct: 0,
        total_incorrect: 0,
        accuracy_percentage: 0,
        last_studied_at: null,
        average_session_time: 0,
        best_accuracy: 0,
        study_streak: 0
      };
    }
  };

  const calculateStudyStreak = (sessions: any[]): number => {
    if (!sessions || sessions.length === 0) return 0;
    
    // Agrupar sessões por data
    const sessionsByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.created_at).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    }, {} as Record<string, any[]>);

    // Contar dias consecutivos de estudo
    const dates = Object.keys(sessionsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of dates) {
      const sessionDate = new Date(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  const loadStatsForSet = async (resumoId: string) => {
    setLoading(true);
    try {
      const setStats = await calculateSetStats(resumoId);
      setStatsData(prev => ({
        ...prev,
        [resumoId]: setStats
      }));
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatsForSets = async (resumoIds: string[]) => {
    setLoading(true);
    try {
      const statsPromises = resumoIds.map(id => calculateSetStats(id));
      const statsResults = await Promise.all(statsPromises);
      
      const newStats = statsResults.reduce((acc, stat) => {
        acc[stat.resumo_id] = stat;
        return acc;
      }, {} as Record<string, FlashcardSetStats>);
      
      setStatsData(newStats);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas múltiplas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsForSet = (resumoId: string): FlashcardSetStats | null => {
    return statsData[resumoId] || null;
  };

  return {
    stats: statsData,
    loading,
    loadStatsForSet,
    loadStatsForSets,
    getStatsForSet
  };
};