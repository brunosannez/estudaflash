-- Fix function search path security issues

-- Update log_sensitive_access function with proper search_path
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  action_type_param text,
  resource_type_param text,
  resource_id_param uuid DEFAULT NULL,
  details_param jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update validate_user_input function with proper search_path
CREATE OR REPLACE FUNCTION public.validate_user_input()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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