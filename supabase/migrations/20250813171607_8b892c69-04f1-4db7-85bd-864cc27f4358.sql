-- Implementar otimizações de segurança e rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limiting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limiting ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate limiting
CREATE POLICY "Users can view their own rate limits" 
ON public.rate_limiting FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert rate limits" 
ON public.rate_limiting FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limiting_user_action ON public.rate_limiting(user_id, action_type, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limiting_ip ON public.rate_limiting(ip_address, window_start);

-- Create two-factor authentication table
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  secret_key TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- RLS policies for 2FA
CREATE POLICY "Users can manage their own 2FA" 
ON public.user_2fa FOR ALL 
USING (auth.uid() = user_id);

-- Create analytics events table for advanced tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  event_name TEXT NOT NULL,
  event_properties JSONB NOT NULL DEFAULT '{}',
  user_properties JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics events
CREATE POLICY "Users can create analytics events" 
ON public.analytics_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events FOR SELECT 
USING (is_current_user_admin());

-- Create index for analytics performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON public.analytics_events(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_timestamp ON public.analytics_events(event_name, timestamp);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  study_reminders BOOLEAN NOT NULL DEFAULT true,
  achievement_alerts BOOLEAN NOT NULL DEFAULT true,
  social_updates BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences FOR ALL 
USING (auth.uid() = user_id);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  target_user_id UUID,
  target_action_type TEXT,
  max_requests INTEGER DEFAULT 100,
  window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Count requests in the current window
  SELECT COUNT(*) INTO current_count
  FROM public.rate_limiting
  WHERE user_id = target_user_id
    AND action_type = target_action_type
    AND window_start > (now() - (window_minutes * INTERVAL '1 minute'));
  
  -- Return false if rate limit exceeded
  IF current_count >= max_requests THEN
    RETURN false;
  END IF;
  
  -- Log this request
  INSERT INTO public.rate_limiting (user_id, action_type)
  VALUES (target_user_id, target_action_type);
  
  RETURN true;
END;
$$;