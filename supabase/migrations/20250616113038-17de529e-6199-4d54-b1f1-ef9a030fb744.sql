
-- Create usage_logs table for detailed action tracking
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('upload', 'resumo', 'quiz', 'flashcard')),
  credits_used INTEGER NOT NULL DEFAULT 1,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own usage logs
CREATE POLICY "Users can view their own usage logs" 
  ON public.usage_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own usage logs
CREATE POLICY "Users can insert their own usage logs" 
  ON public.usage_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on usage queries
CREATE INDEX idx_usage_logs_user_id_timestamp ON public.usage_logs(user_id, timestamp DESC);
CREATE INDEX idx_usage_logs_action_type ON public.usage_logs(action_type);

-- Function to get detailed usage analytics for admin
CREATE OR REPLACE FUNCTION public.get_usage_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  action_type TEXT,
  usage_date DATE,
  total_actions BIGINT,
  unique_users BIGINT,
  total_credits BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar analytics de uso';
  END IF;
  
  RETURN QUERY
  SELECT 
    ul.action_type,
    ul.timestamp::DATE as usage_date,
    COUNT(*) as total_actions,
    COUNT(DISTINCT ul.user_id) as unique_users,
    SUM(ul.credits_used) as total_credits
  FROM public.usage_logs ul
  WHERE ul.timestamp::DATE >= start_date 
    AND ul.timestamp::DATE <= end_date
  GROUP BY ul.action_type, ul.timestamp::DATE
  ORDER BY usage_date DESC, action_type;
END;
$$;

-- Function to get user usage summary for admin
CREATE OR REPLACE FUNCTION public.get_user_usage_summary(target_user_id UUID)
RETURNS TABLE(
  action_type TEXT,
  current_month_usage BIGINT,
  current_month_credits BIGINT,
  all_time_usage BIGINT,
  all_time_credits BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar resumo de uso';
  END IF;
  
  RETURN QUERY
  SELECT 
    ul.action_type,
    COUNT(*) FILTER (WHERE ul.timestamp >= DATE_TRUNC('month', CURRENT_DATE)) as current_month_usage,
    SUM(ul.credits_used) FILTER (WHERE ul.timestamp >= DATE_TRUNC('month', CURRENT_DATE)) as current_month_credits,
    COUNT(*) as all_time_usage,
    SUM(ul.credits_used) as all_time_credits
  FROM public.usage_logs ul
  WHERE ul.user_id = target_user_id
  GROUP BY ul.action_type
  ORDER BY all_time_usage DESC;
END;
$$;

-- Function to log usage (to be called from edge functions)
CREATE OR REPLACE FUNCTION public.log_usage(
  target_user_id UUID,
  target_action_type TEXT,
  target_credits_used INTEGER DEFAULT 1,
  target_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate action type
  IF target_action_type NOT IN ('upload', 'resumo', 'quiz', 'flashcard') THEN
    RAISE EXCEPTION 'Tipo de ação inválido: %', target_action_type;
  END IF;
  
  -- Insert usage log
  INSERT INTO public.usage_logs (user_id, action_type, credits_used, metadata)
  VALUES (target_user_id, target_action_type, target_credits_used, target_metadata);
  
  RETURN TRUE;
END;
$$;

-- Function to activate/deactivate users
CREATE OR REPLACE FUNCTION public.admin_toggle_user_status(
  target_user_id UUID,
  is_active BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem ativar/desativar usuários';
  END IF;
  
  -- Update user status in uso_usuarios table
  UPDATE public.uso_usuarios 
  SET 
    is_admin = CASE 
      WHEN is_active = false THEN false 
      ELSE is_admin 
    END,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- You might want to add additional logic here to actually disable/enable auth
  -- For now, we're just tracking the status
  
  RETURN TRUE;
END;
$$;
