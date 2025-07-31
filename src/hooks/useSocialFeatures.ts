import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SocialService } from '@/services/socialService';
import { UserSocialProfile, Challenge, ChallengeParticipation, LeaderboardWithProfile, SocialActivity } from '@/types/social';
import { toast } from 'sonner';

export const useSocialFeatures = () => {
  const { user } = useAuth();
  const [socialProfile, setSocialProfile] = useState<UserSocialProfile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<ChallengeParticipation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardWithProfile[]>([]);
  const [friendsActivities, setFriendsActivities] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize social profile
  useEffect(() => {
    if (user?.id) {
      initializeSocialProfile();
    }
  }, [user?.id]);

  const initializeSocialProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      let profile = await SocialService.getUserSocialProfile(user.id);
      
      if (!profile) {
        // Create initial social profile
        profile = await SocialService.createOrUpdateSocialProfile({
          user_id: user.id,
          display_name: user.email?.split('@')[0] || 'Usuário',
          is_public: true,
          total_xp: 0,
          current_level: 1,
          badges: [],
          stats: {}
        });
      }
      
      setSocialProfile(profile);
      
      // Load other data
      await Promise.all([
        loadChallenges(),
        loadLeaderboard(),
        loadFriendsActivities()
      ]);
      
    } catch (error) {
      console.error('Error initializing social profile:', error);
      toast.error('Erro ao carregar perfil social');
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const [activeChallenges, userChallengesData] = await Promise.all([
        SocialService.getActiveChallenges(),
        user?.id ? SocialService.getUserChallenges(user.id) : []
      ]);
      
      setChallenges(activeChallenges);
      setUserChallenges(userChallengesData);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const loadLeaderboard = async (
    category: 'xp' | 'flashcards' | 'quiz' | 'streak' = 'xp',
    period: 'daily' | 'weekly' | 'monthly' | 'all_time' = 'weekly'
  ) => {
    try {
      const leaderboardData = await SocialService.getLeaderboard(category, period);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const loadFriendsActivities = async () => {
    if (!user?.id) return;
    
    try {
      const activities = await SocialService.getFriendsActivities(user.id);
      setFriendsActivities(activities);
    } catch (error) {
      console.error('Error loading friends activities:', error);
    }
  };

  const updateSocialProfile = async (updates: Partial<UserSocialProfile>) => {
    if (!user?.id || !socialProfile) return;

    try {
      const updatedProfile = await SocialService.updateSocialProfile(user.id, updates);
      setSocialProfile(updatedProfile);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating social profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      await SocialService.joinChallenge(challengeId);
      await loadChallenges(); // Reload to update participation
      toast.success('Desafio aceito! Boa sorte! 🎯');
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('Erro ao participar do desafio');
    }
  };

  const shareAchievement = async (type: 'level' | 'badge' | 'streak', data: any, platform: 'whatsapp' | 'twitter') => {
    try {
      const message = SocialService.generateShareMessage(type, data);
      const url = platform === 'whatsapp' 
        ? SocialService.getWhatsAppShareUrl(message)
        : SocialService.getTwitterShareUrl(message);
      
      window.open(url, '_blank');
      
      // Track sharing activity
      if (user?.id) {
        await SocialService.createSocialActivity({
          user_id: user.id,
          activity_type: type === 'level' ? 'level_up' : type === 'badge' ? 'badge_earned' : 'streak_milestone',
          title: `Compartilhou ${type === 'level' ? 'nível' : type === 'badge' ? 'conquista' : 'streak'}`,
          description: message,
          metadata: { platform, type, ...data },
          is_public: true
        });
      }
      
      toast.success('Conquista compartilhada! 🎉');
    } catch (error) {
      console.error('Error sharing achievement:', error);
      toast.error('Erro ao compartilhar');
    }
  };

  return {
    socialProfile,
    challenges,
    userChallenges,
    leaderboard,
    friendsActivities,
    loading,
    updateSocialProfile,
    joinChallenge,
    shareAchievement,
    loadLeaderboard,
    refreshData: initializeSocialProfile
  };
};