import { supabase } from '@/integrations/supabase/client';
import { 
  QuizConfiguration, 
  EnhancedQuizSession, 
  EnhancedQuizAttempt, 
  QuizPerformanceStats, 
  QuizBadge, 
  WeakTopic, 
  QuizAnalytics,
  QuizSessionConfig,
  QuizPerformanceReport
} from '@/types/enhancedQuiz';

class EnhancedQuizService {
  // Quiz Configurations
  async createQuizConfiguration(config: Omit<QuizConfiguration, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('quiz_configurations')
      .insert({
        ...config,
        user_id: user.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getQuizConfigurations() {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('quiz_configurations')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateQuizConfiguration(id: string, updates: Partial<QuizConfiguration>) {
    const { data, error } = await supabase
      .from('quiz_configurations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuizConfiguration(id: string) {
    const { error } = await supabase
      .from('quiz_configurations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Enhanced Quiz Sessions
  async createEnhancedQuizSession(
    resumoId: string, 
    quizTitle: string, 
    questionsData: any[], 
    config: QuizSessionConfig = {}
  ): Promise<EnhancedQuizSession> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const sessionData = {
      user_id: user.user.id,
      resumo_id: resumoId,
      quiz_title: quizTitle,
      total_questions: questionsData.length,
      correct_answers: 0,
      current_question_index: 0,
      progress_percentage: 0,
      questions_data: questionsData,
      status: 'in_progress' as const,
      difficulty_level: config.difficultyLevel || 1,
      time_per_question_seconds: config.timeLimit ? Math.floor((config.timeLimit * 60) / questionsData.length) : 30,
      hints_used: 0,
      performance_score: 0,
      weak_topics: [],
      study_recommendations: [],
      session_type: config.sessionType || 'practice',
      tags: config.categoryFilters || []
    };

    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;
    return data as EnhancedQuizSession;
  }

  async updateQuizSession(sessionId: string, updates: Partial<EnhancedQuizSession>) {
    const { data, error } = await supabase
      .from('quiz_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as EnhancedQuizSession;
  }

  async completeQuizSession(sessionId: string): Promise<QuizPerformanceReport> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) throw sessionError || new Error('Session not found');

    // Calculate performance score
    const completionTime = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
    
    const { data: performanceScore } = await supabase
      .rpc('calculate_quiz_performance_score', {
        correct_answers: session.correct_answers,
        total_questions: session.total_questions,
        completion_time_seconds: completionTime,
        hints_used: session.hints_used,
        difficulty_level: session.difficulty_level
      });

    // Get weak topics analysis
    const { data: weakTopics } = await supabase
      .rpc('analyze_quiz_weak_topics', {
        user_uuid: user.user.id,
        last_sessions_count: 5
      });

    // Update session as completed
    const { data: updatedSession, error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        status: 'completed',
        completion_time_seconds: completionTime,
        performance_score: performanceScore || 0,
        weak_topics: (weakTopics || []).map((t: any) => t.topic),
        study_recommendations: (weakTopics || [])
          .filter((t: any) => t.accuracy_percentage < 80)
          .map((t: any) => t.recommendation)
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update daily stats
    await supabase.rpc('update_daily_quiz_stats', {
      target_user_id: user.user.id
    });

    // Check for new badges
    const { data: newBadgesCount } = await supabase.rpc('check_and_award_quiz_badges', {
      target_user_id: user.user.id
    });

    // Get newly earned badges
    const { data: newBadges } = await supabase
      .from('quiz_badges')
      .select('*')
      .eq('user_id', user.user.id)
      .gte('earned_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .order('earned_at', { ascending: false });

    const accuracy = session.total_questions > 0 ? (session.correct_answers / session.total_questions) * 100 : 0;

    return {
      sessionId,
      overallScore: performanceScore || 0,
      accuracy,
      timeEfficiency: completionTime > 0 ? Math.max(0, 100 - (completionTime / (session.total_questions * 30)) * 100) : 0,
      difficultyHandling: session.difficulty_level * 25,
      weakTopics: weakTopics || [],
      recommendations: (weakTopics || [])
        .filter((t: any) => t.accuracy_percentage < 80)
        .map((t: any) => t.recommendation),
      newBadges: (newBadges || []) as QuizBadge[],
      streakUpdated: true,
      xpEarned: session.correct_answers * 10 + (session.total_questions - session.correct_answers) * 2
    };
  }

  // Quiz Attempts
  async saveQuizAttempt(attemptData: Omit<EnhancedQuizAttempt, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attemptData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getQuizAttempts(sessionId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('session_id', sessionId)
      .order('answered_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Performance Stats
  async getPerformanceStats(startDate?: string, endDate?: string): Promise<QuizPerformanceStats[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    let query = supabase
      .from('quiz_performance_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTodayStats(): Promise<QuizPerformanceStats | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('quiz_performance_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Badges
  async getUserBadges(): Promise<QuizBadge[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('quiz_badges')
      .select('*')
      .eq('user_id', user.user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return (data || []) as QuizBadge[];
  }

  // Analytics
  async getQuizAnalytics(): Promise<QuizAnalytics> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    // Get overall stats
    const { data: sessions } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('status', 'completed');

    // Get recent performance
    const { data: recentStats } = await supabase
      .from('quiz_performance_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false })
      .limit(7);

    // Get badges
    const badges = await this.getUserBadges();

    // Get weak topics
    const { data: weakTopics } = await supabase
      .rpc('analyze_quiz_weak_topics', {
        user_uuid: user.user.id,
        last_sessions_count: 10
      });

    const totalQuizzes = sessions?.length || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + s.correct_answers, 0) || 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + s.total_questions, 0) || 0;
    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const totalTimeSpent = sessions?.reduce((sum, s) => sum + (s.completion_time_seconds || 0), 0) || 0;

    // Calculate strongest topics (high accuracy)
    const strongestTopics = (weakTopics || [])
      .filter((t: any) => t.accuracy_percentage >= 85)
      .map((t: any) => t.topic)
      .slice(0, 5);

    // Calculate current and longest streak
    const currentStreak = recentStats?.[0]?.current_streak || 0;
    const longestStreak = Math.max(...(recentStats?.map(s => s.longest_streak) || [0]));
    const lastActivity = recentStats?.[0]?.updated_at || '';

    return {
      totalQuizzes,
      averageAccuracy,
      totalTimeSpent,
      strongestTopics,
      weakestTopics: weakTopics || [],
      recentPerformance: (recentStats || []).map(s => ({
        date: s.date,
        accuracy: s.average_accuracy,
        quizzesCompleted: s.total_quizzes_completed
      })),
      badges,
      streakData: {
        current: currentStreak,
        longest: longestStreak,
        lastActivity
      }
    };
  }

  // Enhanced Quiz History
  async getEnhancedQuizHistory(limit = 20) {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_enhanced_quiz_history', {
        target_user_id: user.user.id
      })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Weekly/Monthly Reports
  async getPerformanceReport(period: 'week' | 'month' = 'week') {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error('User not authenticated');

    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    const stats = await this.getPerformanceStats(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const totalQuizzes = stats.reduce((sum, s) => sum + s.total_quizzes_completed, 0);
    const totalQuestions = stats.reduce((sum, s) => sum + s.total_questions_answered, 0);
    const totalCorrect = stats.reduce((sum, s) => sum + s.total_correct_answers, 0);
    const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    const totalXP = stats.reduce((sum, s) => sum + s.xp_earned_from_quizzes, 0);

    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalQuizzes,
      totalQuestions,
      totalCorrect,
      averageAccuracy,
      totalXP,
      dailyStats: stats
    };
  }
}

export const enhancedQuizService = new EnhancedQuizService();