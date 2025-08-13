import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SocialReaction {
  id: string;
  user_id: string;
  activity_id: string;
  reaction_type: 'like' | 'celebrate' | 'support' | 'wow';
  created_at: string;
}

interface ActivityReactions {
  [activityId: string]: {
    reactions: SocialReaction[];
    counts: { [type: string]: number };
    userReactions: string[];
  };
}

export const useSocialReactions = () => {
  const { user } = useAuth();
  const [activityReactions, setActivityReactions] = useState<ActivityReactions>({});
  const [loading, setLoading] = useState(false);

  const loadReactionsForActivity = async (activityId: string) => {
    try {
      const { data } = await supabase
        .from('social_reactions')
        .select('*')
        .eq('activity_id', activityId);

      if (data) {
        const reactions = data;
        const counts = reactions.reduce((acc, reaction) => {
          acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
          return acc;
        }, {} as { [type: string]: number });

        const userReactions = user 
          ? reactions
              .filter(r => r.user_id === user.id)
              .map(r => r.reaction_type)
          : [];

        setActivityReactions(prev => ({
          ...prev,
          [activityId]: {
            reactions: reactions as SocialReaction[],
            counts,
            userReactions
          }
        }));
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const loadReactionsForActivities = async (activityIds: string[]) => {
    if (activityIds.length === 0) return;

    try {
      setLoading(true);
      const { data } = await supabase
        .from('social_reactions')
        .select('*')
        .in('activity_id', activityIds);

      if (data) {
        const grouped = data.reduce((acc, reaction) => {
          if (!acc[reaction.activity_id]) {
            acc[reaction.activity_id] = [];
          }
          acc[reaction.activity_id].push(reaction as SocialReaction);
          return acc;
        }, {} as { [activityId: string]: SocialReaction[] });

        const processedReactions: ActivityReactions = {};
        
        for (const activityId of activityIds) {
          const reactions = grouped[activityId] || [];
          const counts = reactions.reduce((acc, reaction) => {
            acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
            return acc;
          }, {} as { [type: string]: number });

          const userReactions = user 
            ? reactions
                .filter(r => r.user_id === user.id)
                .map(r => r.reaction_type)
            : [];

          processedReactions[activityId] = {
            reactions,
            counts,
            userReactions
          };
        }

        setActivityReactions(processedReactions);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (activityId: string, reactionType: 'like' | 'celebrate' | 'support' | 'wow') => {
    if (!user) return false;

    try {
      // Check if user already has this reaction
      const currentReactions = activityReactions[activityId]?.userReactions || [];
      if (currentReactions.includes(reactionType)) {
        // Remove reaction if already exists
        await removeReaction(activityId, reactionType);
        return true;
      }

      const { error } = await supabase
        .from('social_reactions')
        .insert({
          user_id: user.id,
          activity_id: activityId,
          reaction_type: reactionType
        });

      if (error) throw error;

      // Refresh reactions for this activity
      await loadReactionsForActivity(activityId);
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Erro ao reagir');
      return false;
    }
  };

  const removeReaction = async (activityId: string, reactionType: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('social_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('activity_id', activityId)
        .eq('reaction_type', reactionType);

      if (error) throw error;

      // Refresh reactions for this activity
      await loadReactionsForActivity(activityId);
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  };

  const getReactionIcon = (type: string) => {
    const icons = {
      like: '👍',
      celebrate: '🎉',
      support: '💪',
      wow: '😮'
    };
    return icons[type as keyof typeof icons] || '👍';
  };

  const getReactionColor = (type: string) => {
    const colors = {
      like: 'text-blue-500',
      celebrate: 'text-yellow-500',
      support: 'text-green-500',
      wow: 'text-purple-500'
    };
    return colors[type as keyof typeof colors] || 'text-gray-500';
  };

  return {
    activityReactions,
    loading,
    loadReactionsForActivity,
    loadReactionsForActivities,
    addReaction,
    removeReaction,
    getReactionIcon,
    getReactionColor
  };
};