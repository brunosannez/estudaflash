import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudyAnalytics {
  id: string;
  user_id: string;
  date: string;
  subject_area?: string;
  total_study_time_minutes: number;
  flashcards_mastered: number;
  quiz_accuracy_percentage: number;
  weak_topics: string[];
  strong_topics: string[];
  learning_velocity: number;
  retention_rate: number;
}

export interface StudyRecommendation {
  recommendation_type: string;
  title: string;
  description: string;
  priority: number;
  estimated_time_minutes: number;
  target_cards: number;
  subject_area: string;
}

export const useStudyAnalytics = () => {
  const [analytics, setAnalytics] = useState<StudyAnalytics[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const updateDailyAnalytics = useCallback(async (
    subject_area: string,
    study_time_minutes: number,
    flashcards_mastered: number,
    quiz_accuracy: number,
    weak_topics: string[] = [],
    strong_topics: string[] = []
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      // Calculate learning velocity (cards per minute)
      const learning_velocity = study_time_minutes > 0 ? flashcards_mastered / study_time_minutes : 0;

      const { error } = await supabase
        .from('study_analytics')
        .upsert({
          user_id: user.id,
          date: today,
          subject_area,
          total_study_time_minutes: study_time_minutes,
          flashcards_mastered,
          quiz_accuracy_percentage: quiz_accuracy,
          weak_topics,
          strong_topics,
          learning_velocity,
          retention_rate: quiz_accuracy // Simplified retention rate
        }, {
          onConflict: 'user_id,date,subject_area'
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error updating daily analytics:', error);
      toast.error('Erro ao atualizar analytics de estudo');
    }
  }, []);

  const fetchAnalytics = useCallback(async (days: number = 30) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      setAnalytics((data || []).map(item => ({
        ...item,
        weak_topics: Array.isArray(item.weak_topics) ? item.weak_topics.filter(t => typeof t === 'string') : [],
        strong_topics: Array.isArray(item.strong_topics) ? item.strong_topics.filter(t => typeof t === 'string') : []
      })));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erro ao carregar analytics');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudyRecommendations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_study_recommendations', {
        target_user_id: user.id
      });

      if (error) throw error;

      setRecommendations(data || []);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendations([]);
    }
  }, []);

  const getWeeklyProgress = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return analytics.filter(item => new Date(item.date) >= weekAgo);
  }, [analytics]);

  const getSubjectPerformance = useCallback(() => {
    const subjectStats = analytics.reduce((acc, item) => {
      const subject = item.subject_area || 'Geral';
      if (!acc[subject]) {
        acc[subject] = {
          total_time: 0,
          total_cards: 0,
          total_accuracy: 0,
          sessions: 0
        };
      }
      acc[subject].total_time += item.total_study_time_minutes;
      acc[subject].total_cards += item.flashcards_mastered;
      acc[subject].total_accuracy += item.quiz_accuracy_percentage;
      acc[subject].sessions += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      avg_accuracy: stats.sessions > 0 ? stats.total_accuracy / stats.sessions : 0,
      total_time: stats.total_time,
      total_cards: stats.total_cards,
      avg_velocity: stats.total_time > 0 ? stats.total_cards / stats.total_time : 0
    }));
  }, [analytics]);

  useEffect(() => {
    fetchAnalytics();
    getStudyRecommendations();
  }, [fetchAnalytics, getStudyRecommendations]);

  return {
    analytics,
    recommendations,
    loading,
    updateDailyAnalytics,
    fetchAnalytics,
    getStudyRecommendations,
    getWeeklyProgress,
    getSubjectPerformance
  };
};