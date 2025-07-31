-- Criar tabelas para funcionalidades sociais e ranking

-- Tabela para perfis sociais públicos dos usuários
CREATE TABLE public.user_social_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para sistema de amizades
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Tabela para desafios e competições
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  category TEXT NOT NULL CHECK (category IN ('flashcards', 'quiz', 'streak', 'xp')),
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  badge_reward TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para participação em desafios
CREATE TABLE public.challenge_participations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Tabela para rankings/leaderboards
CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
  category TEXT NOT NULL CHECK (category IN ('xp', 'flashcards', 'quiz', 'streak')),
  value INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_type, category, period_start)
);

-- Tabela para atividades sociais (feed)
CREATE TABLE public.social_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('level_up', 'badge_earned', 'challenge_completed', 'streak_milestone', 'quiz_perfect')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_activities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_social_profiles
CREATE POLICY "Users can view public profiles" 
ON public.user_social_profiles 
FOR SELECT 
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their own profile" 
ON public.user_social_profiles 
FOR ALL 
USING (user_id = auth.uid());

-- Políticas RLS para friendships
CREATE POLICY "Users can view their friendships" 
ON public.friendships 
FOR SELECT 
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friendship requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update their friendships" 
ON public.friendships 
FOR UPDATE 
USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Políticas RLS para challenges
CREATE POLICY "Challenges are viewable by everyone" 
ON public.challenges 
FOR SELECT 
USING (is_active = true);

-- Políticas RLS para challenge_participations
CREATE POLICY "Users can view their own participations" 
ON public.challenge_participations 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own participations" 
ON public.challenge_participations 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participations" 
ON public.challenge_participations 
FOR UPDATE 
USING (user_id = auth.uid());

-- Políticas RLS para leaderboards
CREATE POLICY "Leaderboards are viewable by everyone" 
ON public.leaderboards 
FOR SELECT 
USING (true);

-- Políticas RLS para social_activities
CREATE POLICY "Users can view public activities and their own" 
ON public.social_activities 
FOR SELECT 
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own activities" 
ON public.social_activities 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Criar índices para performance
CREATE INDEX idx_user_social_profiles_user_id ON public.user_social_profiles(user_id);
CREATE INDEX idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX idx_challenge_participations_user ON public.challenge_participations(user_id);
CREATE INDEX idx_challenge_participations_challenge ON public.challenge_participations(challenge_id);
CREATE INDEX idx_leaderboards_period_category ON public.leaderboards(period_type, category, period_start);
CREATE INDEX idx_social_activities_user ON public.social_activities(user_id);
CREATE INDEX idx_social_activities_created ON public.social_activities(created_at DESC);