import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { BADGES_CATALOG, BadgeDefinition, getRarityStyles } from '@/data/badgesCatalog';

interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_rarity: 'common' | 'rare' | 'epic' | 'legendary';
  badge_category: 'achievement' | 'social' | 'seasonal' | 'collaborative';
  earned_at: string;
  metadata: any;
}

interface UserMetrics {
  uploads_count: number;
  summaries_count: number;
  quizzes_completed: number;
  perfect_quizzes: number;
  flashcards_reviewed: number;
  flashcards_correct: number;
  perfect_sessions: number;
  fast_quiz: number;
  current_streak: number;
  longest_streak: number;
  current_level: number;
  total_xp: number;
  early_study: number;
  night_study: number;
}

// Event for badge unlock animation
export const BADGE_UNLOCK_EVENT = 'badge-unlocked';

export const dispatchBadgeUnlock = (badge: BadgeDefinition) => {
  window.dispatchEvent(new CustomEvent(BADGE_UNLOCK_EVENT, { detail: badge }));
};

export const useAdvancedBadges = () => {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingBadge, setPendingBadge] = useState<BadgeDefinition | null>(null);

  const loadUserBadges = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setUserBadges((data || []) as UserBadge[]);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const awardBadge = useCallback(async (
    userId: string, 
    badgeDef: BadgeDefinition
  ): Promise<boolean> => {
    try {
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badgeDef.id)
        .single();

      if (existingBadge) {
        return false; // Badge already exists
      }

      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_type: badgeDef.id,
          badge_name: badgeDef.name,
          badge_description: badgeDef.description,
          badge_icon: badgeDef.icon,
          badge_rarity: badgeDef.rarity,
          badge_category: badgeDef.category,
          metadata: { requirement: badgeDef.requirement }
        });

      if (error) throw error;

      // Dispatch event for animation
      dispatchBadgeUnlock(badgeDef);
      
      // Show toast
      toast.success(`🏆 Nova conquista: ${badgeDef.name}!`, {
        description: badgeDef.kidFriendlyDescription
      });

      // Refresh badges if it's for current user
      if (userId === user?.id) {
        loadUserBadges();
      }

      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }, [user, loadUserBadges]);

  const fetchUserMetrics = useCallback(async (): Promise<UserMetrics | null> => {
    if (!user) return null;

    try {
      // Fetch all metrics in parallel
      const [
        progressData,
        dailyData,
        resumosData,
        quizData,
        flashcardReviewsData
      ] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).single(),
        supabase.from('daily_activities').select('*').eq('user_id', user.id),
        // Get resumos via uploads that belong to the user
        supabase.from('uploads').select('id, resumos(id)').eq('user_id', user.id),
        supabase.from('enem_quiz_sessions').select('*').eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('flashcard_reviews').select('*').eq('user_id', user.id)
      ]);

      const progress = progressData.data;
      const dailyActivities = dailyData.data || [];
      const uploadsWithResumos = resumosData.data || [];
      const quizSessions = quizData.data || [];
      const flashcardReviews = flashcardReviewsData.data || [];

      // Count uploads and resumos correctly
      const uploadsCount = uploadsWithResumos.length;
      const summariesCount = uploadsWithResumos.reduce((sum, upload: any) => {
        return sum + (upload.resumos?.length || 0);
      }, 0);

      // Calculate metrics
      const totalFlashcardsReviewed = dailyActivities.reduce((sum, d) => sum + (d.flashcards_reviewed || 0), 0);
      const totalQuizzesCompleted = quizSessions.length;
      const perfectQuizzes = quizSessions.filter(q => q.score === q.total_questions).length;
      const fastQuizzes = quizSessions.filter(q => {
        const started = new Date(q.started_at);
        const completed = new Date(q.completed_at || q.last_activity_at);
        const durationMs = completed.getTime() - started.getTime();
        return durationMs < 2 * 60 * 1000; // Less than 2 minutes
      }).length;
      
      const correctReviews = flashcardReviews.filter(r => r.lembrou === true).length;
      
      // Check time-based badges
      const currentHour = new Date().getHours();
      const hasEarlyStudy = currentHour < 7 ? 1 : 0;
      const hasNightStudy = currentHour >= 22 ? 1 : 0;

      return {
        uploads_count: uploadsCount,
        summaries_count: summariesCount,
        quizzes_completed: totalQuizzesCompleted,
        perfect_quizzes: perfectQuizzes,
        flashcards_reviewed: totalFlashcardsReviewed,
        flashcards_correct: correctReviews,
        perfect_sessions: 0, // Need to track separately
        fast_quiz: fastQuizzes,
        current_streak: progress?.current_streak || 0,
        longest_streak: progress?.longest_streak || 0,
        current_level: progress?.current_level || 1,
        total_xp: progress?.total_xp || 0,
        early_study: hasEarlyStudy,
        night_study: hasNightStudy
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      return null;
    }
  }, [user]);

  const checkBadgesForActivity = useCallback(async (
    activityType: 'flashcard' | 'quiz' | 'upload' | 'summary' | 'login',
    activityData?: any
  ) => {
    if (!user) return;

    const metrics = await fetchUserMetrics();
    if (!metrics) return;

    const earnedTypes = new Set(userBadges.map(b => b.badge_type));

    // Check each badge
    for (const badge of BADGES_CATALOG) {
      if (earnedTypes.has(badge.id)) continue;

      let metricValue = 0;
      switch (badge.requirement.metric) {
        case 'uploads_count':
          metricValue = metrics.uploads_count;
          break;
        case 'summaries_count':
          metricValue = metrics.summaries_count;
          break;
        case 'quizzes_completed':
          metricValue = metrics.quizzes_completed;
          break;
        case 'perfect_quizzes':
          metricValue = metrics.perfect_quizzes;
          break;
        case 'flashcards_reviewed':
          metricValue = metrics.flashcards_reviewed;
          break;
        case 'flashcards_correct':
          metricValue = metrics.flashcards_correct;
          break;
        case 'perfect_sessions':
          metricValue = metrics.perfect_sessions;
          break;
        case 'fast_quiz':
          metricValue = metrics.fast_quiz;
          break;
        case 'current_streak':
          metricValue = metrics.current_streak;
          break;
        case 'longest_streak':
          metricValue = metrics.longest_streak;
          break;
        case 'current_level':
          metricValue = metrics.current_level;
          break;
        case 'total_xp':
          metricValue = metrics.total_xp;
          break;
        case 'early_study':
          metricValue = metrics.early_study;
          break;
        case 'night_study':
          metricValue = metrics.night_study;
          break;
      }

      let qualifies = false;
      switch (badge.requirement.comparator) {
        case 'gte':
          qualifies = metricValue >= badge.requirement.value;
          break;
        case 'eq':
          qualifies = metricValue === badge.requirement.value;
          break;
        case 'lte':
          qualifies = metricValue <= badge.requirement.value;
          break;
      }

      if (qualifies) {
        await awardBadge(user.id, badge);
      }
    }
  }, [user, userBadges, fetchUserMetrics, awardBadge]);

  const checkAndAwardProgressBadges = useCallback(async () => {
    await checkBadgesForActivity('login');
  }, [checkBadgesForActivity]);

  const getRarityColor = (rarity: string) => {
    const styles = getRarityStyles(rarity as any);
    return `${styles.text} ${styles.border}`;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      achievement: '🏆',
      social: '👥',
      seasonal: '🎃',
      collaborative: '🤝'
    };
    return icons[category as keyof typeof icons] || '🏆';
  };

  const getNextBadgeToEarn = useCallback((): BadgeDefinition | null => {
    const earnedTypes = new Set(userBadges.map(b => b.badge_type));
    
    // Priority order for next badge suggestions
    const priorityOrder = [
      'first_upload', 'first_summary', 'first_quiz', 'first_flashcard',
      'level_5', 'first_week', 'xp_1000',
      'elephant_memory', 'studious', 'level_10'
    ];

    for (const badgeId of priorityOrder) {
      if (!earnedTypes.has(badgeId)) {
        return BADGES_CATALOG.find(b => b.id === badgeId) || null;
      }
    }

    // Return any unearned badge
    return BADGES_CATALOG.find(b => !earnedTypes.has(b.id)) || null;
  }, [userBadges]);

  useEffect(() => {
    if (user) {
      loadUserBadges();
    }
  }, [user, loadUserBadges]);

  return {
    userBadges,
    loading,
    pendingBadge,
    setPendingBadge,
    awardBadge,
    checkBadgesForActivity,
    checkAndAwardProgressBadges,
    getRarityColor,
    getCategoryIcon,
    getNextBadgeToEarn,
    refreshBadges: loadUserBadges
  };
};