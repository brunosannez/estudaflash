-- Fix: Drop and recreate view without SECURITY DEFINER (views in Supabase don't need it)
-- The view will use the permissions of the querying user by default

DROP VIEW IF EXISTS public.public_plans;

-- Recreate as a simple view (inherits RLS from underlying table)
CREATE VIEW public.public_plans AS
SELECT 
  id,
  name,
  description,
  features,
  is_active,
  uploads_limit,
  summaries_limit,
  flashcards_limit,
  quizzes_limit,
  credits_per_month,
  price_brl,
  price_brl_yearly,
  created_at,
  updated_at
FROM public.plans
WHERE is_active = true;

-- Grant access to authenticated users for the view
GRANT SELECT ON public.public_plans TO authenticated;

-- Add security invoker so it uses the calling user's permissions
ALTER VIEW public.public_plans SET (security_invoker = true);

COMMENT ON VIEW public.public_plans IS 'Public view of plans that hides internal cost data. Uses security_invoker to respect RLS.';