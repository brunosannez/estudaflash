
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProgress, DailyActivity } from '@/types/gamification';

export interface TopicFocus {
  topic: string;
  accuracy: number; // 0-100
  sessions: number;
}

export interface ProgressDataState {
  progress: UserProgress | null;
  todayActivity: DailyActivity | null;
  topicFocus: TopicFocus | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export const useProgressData = () => {
  const [data, setData] = useState<ProgressDataState>({
    progress: null,
    todayActivity: null,
    topicFocus: null,
    loading: true,
    error: null,
    isInitialized: false
  });

  const fetchProgressData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔒 No user found, setting initialized');
        setData(prev => ({ ...prev, loading: false, isInitialized: true }));
        return;
      }

      console.log('🔄 Fetching progress tables from Supabase for user:', user.id);

      const today = new Date().toISOString().split('T')[0];

      // 1) user_progress (fonte de verdade da gamificação)
      let progress: UserProgress | null = null;
      const progressResult = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressResult.error) {
        console.error('❌ Error fetching user_progress:', progressResult.error);
        throw progressResult.error;
      }

      if (!progressResult.data) {
        const insertProgress = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null,
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (insertProgress.error) {
          console.error('❌ Error creating user_progress:', insertProgress.error);
          throw insertProgress.error;
        }

        progress = insertProgress.data;
      } else {
        progress = progressResult.data;
      }

      // 2) daily_activities de hoje (fonte de verdade dos contadores do dia)
      let activity: DailyActivity | null = null;
      const activityResult = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .maybeSingle();

      if (activityResult.error) {
        console.error('❌ Error fetching daily_activities:', activityResult.error);
        throw activityResult.error;
      }

      if (!activityResult.data) {
        const insertActivity = await supabase
          .from('daily_activities')
          .insert({
            user_id: user.id,
            activity_date: today,
            flashcards_reviewed: 0,
            quizzes_completed: 0,
            quiz_correct_answers: 0,
            xp_earned: 0,
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (insertActivity.error) {
          console.error('❌ Error creating daily_activities:', insertActivity.error);
          throw insertActivity.error;
        }

        activity = insertActivity.data;
      } else {
        activity = activityResult.data;
      }

      // 3) Tema para focar (pior desempenho nos quizzes concluídos)
      let topicFocus: TopicFocus | null = null;
      const sessionsResult = await supabase
        .from('enem_quiz_sessions')
        .select('score,total_questions, enem_quiz_metadata(tema)')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (sessionsResult.error) {
        console.error('❌ Error fetching quiz sessions:', sessionsResult.error);
        // não falha a página por isso
      } else {
        const sessions = (sessionsResult.data || []) as any[];
        const byTopic = new Map<string, { correct: number; total: number; sessions: number }>();

        for (const s of sessions) {
          const tema = s?.enem_quiz_metadata?.tema as string | undefined;
          const topic = (tema && tema.trim().length > 0) ? tema.trim() : 'Sem tema';
          const correct = Number(s?.score || 0);
          const total = Math.max(0, Number(s?.total_questions || 0));

          if (total <= 0) continue;

          const entry = byTopic.get(topic) || { correct: 0, total: 0, sessions: 0 };
          entry.correct += correct;
          entry.total += total;
          entry.sessions += 1;
          byTopic.set(topic, entry);
        }

        const topicRows = Array.from(byTopic.entries()).map(([topic, v]) => ({
          topic,
          sessions: v.sessions,
          accuracy: Math.round((v.correct / v.total) * 100)
        }));

        const worst = topicRows
          .filter(r => r.topic !== 'Sem tema')
          .sort((a, b) => a.accuracy - b.accuracy)[0];

        if (worst) {
          topicFocus = worst;
        }
      }

      setData({
        progress,
        todayActivity: activity,
        topicFocus,
        loading: false,
        error: null,
        isInitialized: true
      });

      console.log('✅ Progress loaded (user_progress + daily_activities)');

    } catch (error) {
      console.error('❌ Error loading progress data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar dados de progresso',
        isInitialized: true
      }));
    }
  }, []);

  return {
    data,
    setData,
    fetchProgressData
  };
};
