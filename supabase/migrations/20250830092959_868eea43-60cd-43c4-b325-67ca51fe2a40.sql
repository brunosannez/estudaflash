-- Create Stripe checkout sessions edge function
CREATE OR REPLACE FUNCTION create_stripe_checkout(
  user_uuid UUID,
  plan_name TEXT,
  success_url TEXT,
  cancel_url TEXT
) RETURNS TABLE(checkout_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_record RECORD;
BEGIN
  -- Get plan details
  SELECT id, name, price_brl, price_brl_yearly 
  INTO plan_record
  FROM plans 
  WHERE LOWER(name) = LOWER(plan_name) AND is_active = true;
  
  IF plan_record IS NULL THEN
    RAISE EXCEPTION 'Plano % não encontrado', plan_name;
  END IF;
  
  -- Return checkout URL (this will be handled by the edge function)
  RETURN QUERY SELECT 'checkout_session_created'::TEXT;
END;
$$;