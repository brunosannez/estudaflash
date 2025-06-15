
-- Create the plans table
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price_brl NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_brl_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  uploads_limit INTEGER NOT NULL DEFAULT 0,
  summaries_limit INTEGER NOT NULL DEFAULT 0,
  flashcards_limit INTEGER NOT NULL DEFAULT 0,
  quizzes_limit INTEGER NOT NULL DEFAULT 0,
  quiz_model TEXT NOT NULL DEFAULT 'GPT-3.5',
  summary_model TEXT NOT NULL DEFAULT 'Claude 3',
  flashcard_model TEXT NOT NULL DEFAULT 'DeepSeek-V2',
  is_editable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default plans
INSERT INTO public.plans (name, price_brl, price_brl_yearly, uploads_limit, summaries_limit, flashcards_limit, quizzes_limit, quiz_model, summary_model, flashcard_model) VALUES
('Free', 0, 0, 10, 10, 10, 10, 'GPT-3.5', 'Claude 3', 'DeepSeek-V2'),
('Pro', 28.86, 259.74, 100, 100, 100, 100, 'GPT-4o', 'Claude 3', 'DeepSeek-V2'),
('Pro Max', 86.58, 779.22, 300, 300, 300, 300, 'GPT-4o', 'Claude 3', 'DeepSeek-V2');

-- Add plan_id to uso_usuarios table (linking users to plans)
ALTER TABLE public.uso_usuarios ADD COLUMN plan_id UUID REFERENCES public.plans(id);

-- Update existing users to use Free plan by default
UPDATE public.uso_usuarios 
SET plan_id = (SELECT id FROM public.plans WHERE name = 'Free')
WHERE plan_id IS NULL;

-- Make plan_id NOT NULL after setting defaults
ALTER TABLE public.uso_usuarios ALTER COLUMN plan_id SET NOT NULL;

-- Create subscriptions table for future financial integration
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.plans(id) NOT NULL,
  amount_paid_brl NUMERIC(10,2) NOT NULL,
  payment_method TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  renewal_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for plans (readable by all authenticated users)
CREATE POLICY "Plans are viewable by authenticated users" 
  ON public.plans 
  FOR SELECT 
  TO authenticated
  USING (true);

-- RLS policies for subscriptions (users can only see their own)
CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin functions for plan management
CREATE OR REPLACE FUNCTION public.admin_update_plan(
  target_plan_id UUID,
  new_price_brl NUMERIC DEFAULT NULL,
  new_price_brl_yearly NUMERIC DEFAULT NULL,
  new_uploads_limit INTEGER DEFAULT NULL,
  new_summaries_limit INTEGER DEFAULT NULL,
  new_flashcards_limit INTEGER DEFAULT NULL,
  new_quizzes_limit INTEGER DEFAULT NULL,
  new_quiz_model TEXT DEFAULT NULL,
  new_summary_model TEXT DEFAULT NULL,
  new_flashcard_model TEXT DEFAULT NULL,
  new_is_editable BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem atualizar planos';
  END IF;
  
  -- Update plan with provided values
  UPDATE public.plans
  SET 
    price_brl = COALESCE(new_price_brl, price_brl),
    price_brl_yearly = COALESCE(new_price_brl_yearly, price_brl_yearly),
    uploads_limit = COALESCE(new_uploads_limit, uploads_limit),
    summaries_limit = COALESCE(new_summaries_limit, summaries_limit),
    flashcards_limit = COALESCE(new_flashcards_limit, flashcards_limit),
    quizzes_limit = COALESCE(new_quizzes_limit, quizzes_limit),
    quiz_model = COALESCE(new_quiz_model, quiz_model),
    summary_model = COALESCE(new_summary_model, summary_model),
    flashcard_model = COALESCE(new_flashcard_model, flashcard_model),
    is_editable = COALESCE(new_is_editable, is_editable),
    updated_at = now()
  WHERE id = target_plan_id;
  
  RETURN TRUE;
END;
$$;

-- Function to change user plan
CREATE OR REPLACE FUNCTION public.admin_change_user_plan_new(
  target_user_id UUID,
  new_plan_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar planos de usuários';
  END IF;
  
  -- Verify plan exists
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = new_plan_id) THEN
    RAISE EXCEPTION 'Plano não encontrado';
  END IF;
  
  -- Update user plan
  UPDATE public.uso_usuarios 
  SET plan_id = new_plan_id, updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to get user plan details
CREATE OR REPLACE FUNCTION public.get_user_plan_details(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  plan_name TEXT,
  uploads_limit INTEGER,
  summaries_limit INTEGER,
  flashcards_limit INTEGER,
  quizzes_limit INTEGER,
  quiz_model TEXT,
  summary_model TEXT,
  flashcard_model TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    p.uploads_limit,
    p.summaries_limit,
    p.flashcards_limit,
    p.quizzes_limit,
    p.quiz_model,
    p.summary_model,
    p.flashcard_model
  FROM public.uso_usuarios uu
  JOIN public.plans p ON uu.plan_id = p.id
  WHERE uu.user_id = user_uuid;
END;
$$;
