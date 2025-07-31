import { supabase } from '@/integrations/supabase/client';
import { UserSocialProfile, Friendship, Challenge, ChallengeParticipation, Leaderboard, SocialActivity, LeaderboardWithProfile } from '@/types/social';

export class SocialService {
  // === USER SOCIAL PROFILES ===
  static async getUserSocialProfile(userId: string): Promise<UserSocialProfile | null> {
    const { data, error } = await supabase
      .from('user_social_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async createOrUpdateSocialProfile(profile: any): Promise<UserSocialProfile> {
    const { data, error } = await supabase
      .from('user_social_profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as UserSocialProfile;
  }

  static async updateSocialProfile(userId: string, updates: Partial<UserSocialProfile>): Promise<UserSocialProfile> {
    const { data, error } = await supabase
      .from('user_social_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserSocialProfile;
  }

  // === FRIENDSHIPS ===
  static async getFriends(userId: string): Promise<UserSocialProfile[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        requester_id,
        addressee_id,
        status
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;

    // Get the friend IDs and then fetch their profiles
    const friendIds = data?.map(friendship => 
      friendship.requester_id === userId ? friendship.addressee_id : friendship.requester_id
    ) || [];

    if (friendIds.length === 0) return [];

    const { data: profiles, error: profilesError } = await supabase
      .from('user_social_profiles')
      .select('*')
      .in('user_id', friendIds);

    if (profilesError) throw profilesError;
    return profiles as UserSocialProfile[] || [];
  }

  static async sendFriendRequest(targetUserId: string): Promise<Friendship> {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: (await supabase.auth.getUser()).data.user?.id,
        addressee_id: targetUserId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Friendship;
  }

  static async respondToFriendRequest(friendshipId: string, status: 'accepted' | 'blocked'): Promise<Friendship> {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;
    return data as Friendship;
  }

  // === CHALLENGES ===
  static async getActiveChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString().split('T')[0])
      .gte('end_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return (data as Challenge[]) || [];
  }

  static async getUserChallenges(userId: string): Promise<ChallengeParticipation[]> {
    const { data, error } = await supabase
      .from('challenge_participations')
      .select(`
        *,
        challenge:challenges(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return (data as ChallengeParticipation[]) || [];
  }

  static async joinChallenge(challengeId: string): Promise<ChallengeParticipation> {
    const { data, error } = await supabase
      .from('challenge_participations')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        challenge_id: challengeId,
        current_progress: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChallengeParticipation;
  }

  static async updateChallengeProgress(challengeId: string, progress: number): Promise<ChallengeParticipation> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('challenge_participations')
      .update({ 
        current_progress: progress,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .select()
      .single();

    if (error) throw error;
    return data as ChallengeParticipation;
  }

  // === LEADERBOARDS ===
  static async getLeaderboard(
    category: string,
    period: string,
    limit: number = 50
  ): Promise<LeaderboardWithProfile[]> {
    const { data: leaderboardData, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('category', category)
      .eq('period_type', period)
      .order('rank_position', { ascending: true })
      .limit(limit);

    if (error) throw error;
    
    if (!leaderboardData || leaderboardData.length === 0) return [];

    const userIds = leaderboardData.map(item => item.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('user_social_profiles')
      .select('*')
      .in('user_id', userIds);

    if (profilesError) throw profilesError;

    return leaderboardData.map(entry => ({
      ...entry,
      profile: profiles?.find(p => p.user_id === entry.user_id) || {} as UserSocialProfile
    })) as LeaderboardWithProfile[];
  }

  static async getUserRank(
    userId: string,
    category: string,
    period: string
  ): Promise<Leaderboard | null> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('period_type', period)
      .maybeSingle();

    if (error) throw error;
    return data as Leaderboard | null;
  }

  // === SOCIAL ACTIVITIES ===
  static async createSocialActivity(activity: Omit<SocialActivity, 'id' | 'created_at'>): Promise<SocialActivity> {
    const { data, error } = await supabase
      .from('social_activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data as SocialActivity;
  }

  static async getFriendsActivities(userId: string, limit: number = 20): Promise<SocialActivity[]> {
    // Get user's friends first
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.user_id);
    
    if (friendIds.length === 0) return [];

    const { data, error } = await supabase
      .from('social_activities')
      .select('*')
      .in('user_id', friendIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as SocialActivity[]) || [];
  }

  // === SHARING ===
  static generateShareMessage(type: 'level' | 'badge' | 'streak', data: any): string {
    switch (type) {
      case 'level':
        return `🎓 Acabei de alcançar o nível ${data.level} no EstudaFlash! 🚀\n\n${data.xp} XP conquistados estudando! 📚\n\n#EstudaFlash #Estudos`;
      case 'badge':
        return `🏆 Conquistei a conquista "${data.badge}"! 🌟\n\nContinuando minha jornada de estudos no EstudaFlash! 💪\n\n#EstudaFlash #Conquista`;
      case 'streak':
        return `🔥 ${data.streak} dias seguidos estudando! 📖\n\nMantendo a consistência no EstudaFlash! 💯\n\n#EstudaFlash #Streak`;
      default:
        return `🎯 Progredindo nos estudos com EstudaFlash! 📚\n\n#EstudaFlash #Estudos`;
    }
  }

  static getWhatsAppShareUrl(message: string): string {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  static getTwitterShareUrl(message: string): string {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  }
}