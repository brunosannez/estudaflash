-- Create study groups/clans table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER DEFAULT 50,
  group_type TEXT NOT NULL DEFAULT 'study', -- 'study', 'competition', 'collaboration'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study group memberships
CREATE TABLE public.study_group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'member', 'moderator', 'admin'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create social reactions table for feed interactions
CREATE TABLE public.social_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.social_activities(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- 'like', 'celebrate', 'support', 'wow'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_id, reaction_type)
);

-- Create social comments table
CREATE TABLE public.social_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_id UUID NOT NULL REFERENCES public.social_activities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create advanced badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT DEFAULT '🏆',
  badge_rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  badge_category TEXT NOT NULL DEFAULT 'achievement', -- 'achievement', 'social', 'seasonal', 'collaborative'
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create team challenges table
CREATE TABLE public.team_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_members UUID[] NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study groups
CREATE POLICY "Public groups are viewable by everyone" ON public.study_groups
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Users can create their own groups" ON public.study_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update their groups" ON public.study_groups
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for group memberships
CREATE POLICY "Users can view group memberships" ON public.study_group_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.study_groups WHERE id = group_id AND (is_public = true OR creator_id = auth.uid()))
  );

CREATE POLICY "Users can join groups" ON public.study_group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for social reactions
CREATE POLICY "Users can view public reactions" ON public.social_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reactions" ON public.social_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON public.social_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for social comments
CREATE POLICY "Users can view public comments" ON public.social_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON public.social_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.social_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- RLS Policies for team challenges
CREATE POLICY "Users can view team challenges they're part of" ON public.team_challenges
  FOR SELECT USING (auth.uid() = ANY(team_members));

CREATE POLICY "Users can create team challenges" ON public.team_challenges
  FOR INSERT WITH CHECK (auth.uid() = ANY(team_members));