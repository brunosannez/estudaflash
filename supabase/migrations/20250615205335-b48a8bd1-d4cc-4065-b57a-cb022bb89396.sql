
-- Add missing columns to the plans table
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description text DEFAULT '',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update the admin_update_plan function to handle new fields
CREATE OR REPLACE FUNCTION public.admin_update_plan(
  target_plan_id uuid, 
  new_price_brl numeric DEFAULT NULL::numeric, 
  new_price_brl_yearly numeric DEFAULT NULL::numeric, 
  new_uploads_limit integer DEFAULT NULL::integer, 
  new_summaries_limit integer DEFAULT NULL::integer, 
  new_flashcards_limit integer DEFAULT NULL::integer, 
  new_quizzes_limit integer DEFAULT NULL::integer, 
  new_quiz_model text DEFAULT NULL::text, 
  new_summary_model text DEFAULT NULL::text, 
  new_flashcard_model text DEFAULT NULL::text, 
  new_is_editable boolean DEFAULT NULL::boolean,
  new_features text[] DEFAULT NULL::text[],
  new_description text DEFAULT NULL::text,
  new_is_active boolean DEFAULT NULL::boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    features = COALESCE(new_features, features),
    description = COALESCE(new_description, description),
    is_active = COALESCE(new_is_active, is_active),
    updated_at = now()
  WHERE id = target_plan_id;
  
  RETURN TRUE;
END;
$function$;

-- Create function to create new plans
CREATE OR REPLACE FUNCTION public.admin_create_plan(
  plan_name text,
  plan_description text DEFAULT '',
  plan_price_brl numeric DEFAULT 0,
  plan_price_brl_yearly numeric DEFAULT 0,
  plan_uploads_limit integer DEFAULT 0,
  plan_summaries_limit integer DEFAULT 0,
  plan_flashcards_limit integer DEFAULT 0,
  plan_quizzes_limit integer DEFAULT 0,
  plan_quiz_model text DEFAULT 'GPT-3.5',
  plan_summary_model text DEFAULT 'Claude 3',
  plan_flashcard_model text DEFAULT 'DeepSeek-V2',
  plan_features text[] DEFAULT '{}',
  plan_is_active boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_plan_id uuid;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem criar planos';
  END IF;
  
  -- Insert new plan
  INSERT INTO public.plans (
    name, description, price_brl, price_brl_yearly,
    uploads_limit, summaries_limit, flashcards_limit, quizzes_limit,
    quiz_model, summary_model, flashcard_model, features, is_active
  ) VALUES (
    plan_name, plan_description, plan_price_brl, plan_price_brl_yearly,
    plan_uploads_limit, plan_summaries_limit, plan_flashcards_limit, plan_quizzes_limit,
    plan_quiz_model, plan_summary_model, plan_flashcard_model, plan_features, plan_is_active
  )
  RETURNING id INTO new_plan_id;
  
  RETURN new_plan_id;
END;
$function$;

-- Function to get only active plans for public signup
CREATE OR REPLACE FUNCTION public.get_active_plans()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price_brl numeric,
  price_brl_yearly numeric,
  uploads_limit integer,
  summaries_limit integer,
  flashcards_limit integer,
  quizzes_limit integer,
  quiz_model text,
  summary_model text,
  flashcard_model text,
  features text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.name, p.description, p.price_brl, p.price_brl_yearly,
    p.uploads_limit, p.summaries_limit, p.flashcards_limit, p.quizzes_limit,
    p.quiz_model, p.summary_model, p.flashcard_model, p.features
  FROM public.plans p
  WHERE p.is_active = true
  ORDER BY p.price_brl ASC;
END;
$function$;
