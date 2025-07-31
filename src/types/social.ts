export interface UserSocialProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  is_public: boolean;
  total_xp: number;
  current_level: number;
  badges: any; // JSONB type from Supabase
  stats: any; // JSONB type from Supabase
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string; // Will be 'pending' | 'accepted' | 'blocked' in practice
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string; // Will be 'daily' | 'weekly' | 'monthly' | 'special' in practice
  category: string; // Will be 'flashcards' | 'quiz' | 'streak' | 'xp' in practice
  target_value: number;
  xp_reward: number;
  badge_reward?: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeParticipation {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Leaderboard {
  id: string;
  user_id: string;
  period_type: string; // Will be 'daily' | 'weekly' | 'monthly' | 'all_time' in practice
  category: string; // Will be 'xp' | 'flashcards' | 'quiz' | 'streak' in practice
  value: number;
  rank_position: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface SocialActivity {
  id: string;
  user_id: string;
  activity_type: string; // Will be 'level_up' | 'badge_earned' | 'challenge_completed' | 'streak_milestone' | 'quiz_perfect' in practice
  title: string;
  description?: string | null;
  metadata: any; // JSONB type from Supabase
  is_public: boolean;
  created_at: string;
}

export interface LeaderboardWithProfile extends Leaderboard {
  profile: UserSocialProfile;
}