
import { supabase } from '@/integrations/supabase/client';
import { UserProgress, DailyActivity } from '@/types/gamification';

export const fetchHistoricalData = async (userId: string) => {
  console.log('🔄 Fetching historical data for user:', userId);

  const [flashcardReviews, quizSessions, quizAnswers] = await Promise.all([
    supabase.from('flashcard_reviews').select('*').eq('user_id', userId),
    supabase.from('quiz_sessions').select('*').eq('user_id', userId),
    supabase.from('quiz_respostas').select('*').eq('user_id', userId)
  ]);

  console.log('📊 Historical data fetched:', {
    flashcards: flashcardReviews.data?.length || 0,
    sessions: quizSessions.data?.length || 0,
    answers: quizAnswers.data?.length || 0
  });

  return {
    flashcardReviews: flashcardReviews.data || [],
    quizSessions: quizSessions.data || [],
    quizAnswers: quizAnswers.data || []
  };
};

export const upsertUserProgress = async (userId: string, progressData: Partial<UserProgress>) => {
  const { data: existingProgress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  const dataToSave = {
    user_id: userId,
    ...progressData,
    updated_at: new Date().toISOString()
  };

  if (existingProgress) {
    const { data, error } = await supabase
      .from('user_progress')
      .update(dataToSave)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_progress')
      .insert(dataToSave)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const upsertDailyActivity = async (userId: string, activityData: Partial<DailyActivity>) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingActivity } = await supabase
    .from('daily_activities')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_date', today)
    .maybeSingle();

  const dataToSave = {
    user_id: userId,
    activity_date: today,
    ...activityData,
    updated_at: new Date().toISOString()
  };

  if (existingActivity) {
    const { data, error } = await supabase
      .from('daily_activities')
      .update(dataToSave)
      .eq('user_id', userId)
      .eq('activity_date', today)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('daily_activities')
      .insert(dataToSave)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
