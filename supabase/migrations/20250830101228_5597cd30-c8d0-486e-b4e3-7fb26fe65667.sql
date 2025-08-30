-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.log_encryption_key_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;