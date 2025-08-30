-- Fix critical security vulnerability: guardian_encryption_keys table lacks RLS policies
-- This table contains sensitive encryption keys and must be protected

-- Enable Row Level Security on guardian_encryption_keys table
ALTER TABLE public.guardian_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Create very restrictive policies - only system admins can access encryption keys
CREATE POLICY "Only admins can view encryption keys"
ON public.guardian_encryption_keys
FOR SELECT
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can insert encryption keys"
ON public.guardian_encryption_keys
FOR INSERT
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Only admins can update encryption keys"
ON public.guardian_encryption_keys
FOR UPDATE
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can delete encryption keys"
ON public.guardian_encryption_keys
FOR DELETE
USING (public.is_current_user_admin());

-- Verify that existing SECURITY DEFINER functions still work
-- These functions bypass RLS policies when called:
-- - get_cpf_encryption_key() - used by triggers and guardian access functions
-- - get_active_guardian_key_version() - used by admin security component
-- - rotate_guardian_cpf_key() - used by admin key rotation

-- Add audit logging for direct table access attempts
CREATE OR REPLACE FUNCTION public.log_encryption_key_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any direct access attempts to encryption keys table
  INSERT INTO public.guardian_access_audit (
    accessor_user_id, 
    target_user_id, 
    reason,
    accessed_fields
  ) VALUES (
    auth.uid(),
    auth.uid(), -- self-access for key operations
    TG_OP || ' on encryption keys table',
    ARRAY['encryption_keys']
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;