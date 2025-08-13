import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

interface FriendProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  total_xp: number;
  current_level: number;
}

export const useFriendships = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriendships = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load accepted friends with manual join
      const { data: friendships } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (friendships) {
        const friendIds = friendships.map(f => 
          f.requester_id === user.id ? f.addressee_id : f.requester_id
        );

        if (friendIds.length > 0) {
          const { data: profiles } = await supabase
            .from('user_social_profiles')
            .select('id, user_id, display_name, avatar_url, total_xp, current_level')
            .in('user_id', friendIds);

          if (profiles) {
            setFriends(profiles.map(p => ({ ...p, id: p.user_id })));
          }
        }
      }

      // Load pending requests (received)
      const { data: pending } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      setPendingRequests((pending || []) as Friendship[]);

      // Load sent requests
      const { data: sent } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      setSentRequests((sent || []) as Friendship[]);

    } catch (error) {
      console.error('Error loading friendships:', error);
      toast.error('Erro ao carregar amizades');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Solicitação de amizade enviada!');
      loadFriendships();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Erro ao enviar solicitação');
      return false;
    }
  };

  const respondToFriendRequest = async (friendshipId: string, response: 'accepted' | 'blocked') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ 
          status: response,
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId);

      if (error) throw error;

      const message = response === 'accepted' 
        ? 'Solicitação aceita!' 
        : 'Solicitação recusada';
      
      toast.success(message);
      loadFriendships();
      return true;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast.error('Erro ao responder solicitação');
      return false;
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Amizade removida');
      loadFriendships();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Erro ao remover amizade');
      return false;
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) return [];

    try {
      const { data } = await supabase
        .from('user_social_profiles')
        .select('id, user_id, display_name, avatar_url, total_xp, current_level')
        .ilike('display_name', `%${query}%`)
        .neq('user_id', user?.id)
        .limit(10);

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadFriendships();
    }
  }, [user]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    searchUsers,
    refreshFriendships: loadFriendships
  };
};