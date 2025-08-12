-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 1) Add encrypted column for CPF
ALTER TABLE public.guardians
ADD COLUMN IF NOT EXISTS cpf_encrypted bytea;

-- 2) Helper function to return encryption key
-- NOTE: Replace the constant with a rotated value later
CREATE OR REPLACE FUNCTION public.get_cpf_encryption_key()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'change_me_rotate_in_production_please_32_chars_min'::text;
$$;

-- 3) Trigger function to encrypt CPF on write
CREATE OR REPLACE FUNCTION public.encrypt_guardian_cpf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.cpf IS NOT NULL AND btrim(NEW.cpf) <> '' THEN
    NEW.cpf_encrypted := pgp_sym_encrypt(NEW.cpf, public.get_cpf_encryption_key());
    NEW.cpf := NULL; -- remove plaintext at rest
  END IF;
  RETURN NEW;
END;
$$;

-- 4) Attach trigger
DROP TRIGGER IF EXISTS trg_encrypt_guardian_cpf ON public.guardians;
CREATE TRIGGER trg_encrypt_guardian_cpf
BEFORE INSERT OR UPDATE ON public.guardians
FOR EACH ROW EXECUTE FUNCTION public.encrypt_guardian_cpf();

-- 5) Backfill encrypt existing CPFs and null plaintext
UPDATE public.guardians
SET cpf_encrypted = pgp_sym_encrypt(cpf, public.get_cpf_encryption_key()),
    cpf = NULL
WHERE cpf IS NOT NULL AND btrim(cpf) <> ''
  AND (cpf_encrypted IS NULL OR length(cpf_encrypted) = 0);

-- 6) Create audit table for sensitive access
CREATE TABLE IF NOT EXISTS public.guardian_access_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  accessed_fields text[] NOT NULL DEFAULT ARRAY['cpf'],
  reason text DEFAULT 'admin_view'
);

-- Enable RLS on audit table
ALTER TABLE public.guardian_access_audit ENABLE ROW LEVEL SECURITY;

-- Policies: admins can view audit; allow inserts (for logging via function)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'guardian_access_audit' AND policyname = 'Admins can view guardian audit' 
  ) THEN
    CREATE POLICY "Admins can view guardian audit"
      ON public.guardian_access_audit
      FOR SELECT
      USING (public.is_current_user_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'guardian_access_audit' AND policyname = 'Allow inserts for audit logging' 
  ) THEN
    CREATE POLICY "Allow inserts for audit logging"
      ON public.guardian_access_audit
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 7) Secure function to fetch guardian info with decrypted CPF
CREATE OR REPLACE FUNCTION public.get_guardian_by_user(target_user_id uuid)
RETURNS TABLE(full_name text, email text, phone text, cpf text, relation_to_student text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow only admins or the owner to access
  IF NOT (public.is_current_user_admin() OR auth.uid() = target_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Log access (best-effort)
  INSERT INTO public.guardian_access_audit (accessor_user_id, target_user_id)
  VALUES (auth.uid(), target_user_id);

  RETURN QUERY
  SELECT 
    g.full_name,
    g.email,
    g.phone,
    CASE 
      WHEN g.cpf_encrypted IS NOT NULL THEN convert_from(pgp_sym_decrypt(g.cpf_encrypted, public.get_cpf_encryption_key()), 'UTF8')
      ELSE g.cpf
    END AS cpf,
    g.relation_to_student
  FROM public.guardians g
  WHERE g.user_id = target_user_id
  LIMIT 1;
END;
$$;