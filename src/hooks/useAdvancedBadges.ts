import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

export const useAdvancedBadges = () => {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserBadges = async () => {
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
  };

  const awardBadge = async (
    userId: string, 
    badgeData: {
      badge_type: string;
      badge_name: string;
      badge_description: string;
      badge_icon?: string;
      badge_rarity?: 'common' | 'rare' | 'epic' | 'legendary';
      badge_category?: 'achievement' | 'social' | 'seasonal' | 'collaborative';
      metadata?: any;
    }
  ) => {
    try {
      // Check if user already has this badge
      const { data: existingBadge } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badgeData.badge_type)
        .single();

      if (existingBadge) {
        return false; // Badge already exists
      }

      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          ...badgeData,
          badge_icon: badgeData.badge_icon || '🏆',
          badge_rarity: badgeData.badge_rarity || 'common',
          badge_category: badgeData.badge_category || 'achievement',
          metadata: badgeData.metadata || {}
        });

      if (error) throw error;

      // Refresh badges if it's for current user
      if (userId === user?.id) {
        loadUserBadges();
      }

      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  };

  const checkAndAwardProgressBadges = async () => {
    if (!user) return;

    try {
      // Get user's current progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!progress) return;

      const badgesToCheck = [
        // Level badges
        {
          condition: progress.current_level >= 5,
          badge: {
            badge_type: 'level_5',
            badge_name: 'Estudante Dedicado',
            badge_description: 'Alcançou o nível 5',
            badge_icon: '⭐',
            badge_rarity: 'common' as const
          }
        },
        {
          condition: progress.current_level >= 10,
          badge: {
            badge_type: 'level_10',
            badge_name: 'Acadêmico',
            badge_description: 'Alcançou o nível 10',
            badge_icon: '🎓',
            badge_rarity: 'rare' as const
          }
        },
        {
          condition: progress.current_level >= 25,
          badge: {
            badge_type: 'level_25',
            badge_name: 'Mestre dos Estudos',
            badge_description: 'Alcançou o nível 25',
            badge_icon: '👑',
            badge_rarity: 'epic' as const
          }
        },
        // Streak badges
        {
          condition: progress.longest_streak >= 7,
          badge: {
            badge_type: 'streak_week',
            badge_name: 'Constância',
            badge_description: 'Manteve uma sequência de 7 dias',
            badge_icon: '🔥',
            badge_rarity: 'common' as const
          }
        },
        {
          condition: progress.longest_streak >= 30,
          badge: {
            badge_type: 'streak_month',
            badge_name: 'Persistência',
            badge_description: 'Manteve uma sequência de 30 dias',
            badge_icon: '💎',
            badge_rarity: 'rare' as const
          }
        },
        // XP badges
        {
          condition: progress.total_xp >= 1000,
          badge: {
            badge_type: 'xp_1000',
            badge_name: 'Colecionador de XP',
            badge_description: 'Acumulou 1.000 pontos de experiência',
            badge_icon: '💰',
            badge_rarity: 'common' as const
          }
        },
        {
          condition: progress.total_xp >= 10000,
          badge: {
            badge_type: 'xp_10000',
            badge_name: 'Especialista',
            badge_description: 'Acumulou 10.000 pontos de experiência',
            badge_icon: '💯',
            badge_rarity: 'epic' as const
          }
        }
      ];

      for (const { condition, badge } of badgesToCheck) {
        if (condition) {
          const awarded = await awardBadge(user.id, badge);
          if (awarded) {
            toast.success(`🏆 Nova conquista: ${badge.badge_name}!`);
          }
        }
      }

    } catch (error) {
      console.error('Error checking progress badges:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-600 border-gray-300',
      rare: 'text-blue-600 border-blue-300',
      epic: 'text-purple-600 border-purple-300',
      legendary: 'text-yellow-600 border-yellow-300'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
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

  useEffect(() => {
    if (user) {
      loadUserBadges();
    }
  }, [user]);

  return {
    userBadges,
    loading,
    awardBadge,
    checkAndAwardProgressBadges,
    getRarityColor,
    getCategoryIcon,
    refreshBadges: loadUserBadges
  };
};