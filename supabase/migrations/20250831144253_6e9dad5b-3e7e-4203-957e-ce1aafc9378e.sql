-- PHASE 1: Critical Security Fixes - Data Access Policies

-- 1. Secure Business Configuration Data - Remove public access to pricing/profit data
DROP POLICY IF EXISTS "Everyone can view credits config" ON public.action_credits_config;

-- Create admin-only policy for action_credits_config
CREATE POLICY "Only admins can view credits config"
ON public.action_credits_config
FOR SELECT
USING (public.is_current_user_admin());

-- 2. Secure Social Profiles - Require authentication to view profiles
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user_social_profiles;

-- Create authenticated-only policy with privacy controls
CREATE POLICY "Authenticated users can view public profiles"
ON public.user_social_profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    is_public = true 
    OR user_id = auth.uid()
    OR public.is_current_user_admin()
  )
);

-- 3. Add privacy controls to social profiles
ALTER TABLE public.user_social_profiles 
ADD COLUMN IF NOT EXISTS privacy_level text DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'friends_only'));

-- Update existing records to have proper privacy level
UPDATE public.user_social_profiles 
SET privacy_level = CASE 
  WHEN is_public THEN 'public' 
  ELSE 'private' 
END
WHERE privacy_level IS NULL;

-- 4. Enhanced Guardian Data Protection - Add additional security layer
CREATE POLICY "Enhanced guardian access control"
ON public.guardians
FOR SELECT
USING (
  public.is_current_user_admin() 
  AND auth.uid() IS NOT NULL
);

-- Drop the old more permissive policy if it exists
DROP POLICY IF EXISTS "Users can view their guardian data" ON public.guardians;

-- 5. Add security audit table for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins can view security audit logs"
ON public.security_audit_log
FOR ALL
USING (public.is_current_user_admin());

-- 6. Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  action_type_param text,
  resource_type_param text,
  resource_id_param uuid DEFAULT NULL,
  details_param jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    action_type_param,
    resource_type_param,
    resource_id_param,
    details_param
  );
END;
$$;

-- 7. Enhanced rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limiting_enhanced (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  ip_address inet,
  window_start timestamp with time zone DEFAULT now(),
  request_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on enhanced rate limiting
ALTER TABLE public.rate_limiting_enhanced ENABLE ROW LEVEL SECURITY;

-- Only system can write, admins can read
CREATE POLICY "System can manage rate limiting"
ON public.rate_limiting_enhanced
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view rate limiting"
ON public.rate_limiting_enhanced
FOR SELECT
USING (public.is_current_user_admin());

-- 8. Add input validation trigger for user inputs
CREATE OR REPLACE FUNCTION public.validate_user_input()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate display name for XSS
  IF NEW.display_name IS NOT NULL THEN
    IF NEW.display_name ~ '<[^>]*>' THEN
      RAISE EXCEPTION 'Display name contains invalid characters';
    END IF;
    IF length(NEW.display_name) > 100 THEN
      RAISE EXCEPTION 'Display name too long (max 100 characters)';
    END IF;
  END IF;
  
  -- Validate bio for XSS
  IF NEW.bio IS NOT NULL THEN
    IF NEW.bio ~ '<script|javascript:|data:' THEN
      RAISE EXCEPTION 'Bio contains potentially malicious content';
    END IF;
    IF length(NEW.bio) > 500 THEN
      RAISE EXCEPTION 'Bio too long (max 500 characters)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply input validation to social profiles
DROP TRIGGER IF EXISTS validate_social_profile_input ON public.user_social_profiles;
CREATE TRIGGER validate_social_profile_input
  BEFORE INSERT OR UPDATE ON public.user_social_profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_input();