
-- Create api_usage_tracking table for monitoring API consumption
CREATE TABLE public.api_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_provider TEXT NOT NULL CHECK (api_provider IN ('openai', 'anthropic', 'huggingface')),
  action_type TEXT NOT NULL CHECK (action_type IN ('summary', 'quiz', 'flashcard', 'ocr')),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  model_used TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for api_usage_tracking
ALTER TABLE public.api_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own API usage
CREATE POLICY "Users can view their own API usage" 
  ON public.api_usage_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own API usage
CREATE POLICY "Users can create their own API usage records" 
  ON public.api_usage_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all API usage
CREATE POLICY "Admins can view all API usage" 
  ON public.api_usage_tracking 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.uso_usuarios 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Add index for better performance
CREATE INDEX idx_api_usage_user_timestamp ON public.api_usage_tracking(user_id, timestamp DESC);
CREATE INDEX idx_api_usage_provider_timestamp ON public.api_usage_tracking(api_provider, timestamp DESC);
