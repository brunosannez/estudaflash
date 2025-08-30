-- Configure brunosannez@hotmail.com as super admin with unlimited plan
-- First, let's create an admin plan with unlimited everything

-- Create unlimited admin plan
INSERT INTO public.plans (
  name, 
  description, 
  price_brl, 
  price_brl_yearly,
  credits_per_month,
  credits_cost_brl,
  is_active,
  is_editable
) VALUES (
  'Admin Unlimited',
  'Plano administrativo com recursos ilimitados',
  0,
  0, 
  999999, -- Unlimited credits
  0, -- No cost
  true,
  false -- Not editable by regular users
) ON CONFLICT (name) DO UPDATE SET
  credits_per_month = 999999,
  credits_cost_brl = 0,
  is_active = true;

-- Function to setup admin user with unlimited plan
CREATE OR REPLACE FUNCTION public.setup_super_admin(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  target_user_id uuid;
  admin_plan_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = admin_email;
  
  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found. They need to sign up first.', admin_email;
    RETURN false;
  END IF;
  
  -- Get admin plan ID
  SELECT id INTO admin_plan_id
  FROM public.plans
  WHERE name = 'Admin Unlimited'
  LIMIT 1;
  
  -- Add to admin_users table
  INSERT INTO public.admin_users (user_id, email)
  VALUES (target_user_id, admin_email)
  ON CONFLICT (email) DO NOTHING;
  
  -- Update uso_usuarios with admin privileges and unlimited plan
  INSERT INTO public.uso_usuarios (
    user_id,
    plan_id,
    is_admin,
    credits_remaining,
    credits_used_this_month,
    last_credits_reset
  ) VALUES (
    target_user_id,
    admin_plan_id,
    true,
    999999,
    0,
    CURRENT_DATE
  ) ON CONFLICT (user_id) DO UPDATE SET
    plan_id = admin_plan_id,
    is_admin = true,
    credits_remaining = 999999,
    credits_used_this_month = 0,
    last_credits_reset = CURRENT_DATE,
    updated_at = now();
  
  -- Create user profile if it doesn't exist
  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    date_of_birth,
    is_minor
  ) VALUES (
    target_user_id,
    'Administrador Sistema',
    '1990-01-01',
    false
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Setup brunosannez@hotmail.com as super admin
SELECT public.setup_super_admin('brunosannez@hotmail.com');