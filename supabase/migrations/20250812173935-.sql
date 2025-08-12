-- 1) Tabela de chaves de criptografia com versionamento
CREATE TABLE IF NOT EXISTS public.guardian_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_version INTEGER UNIQUE NOT NULL,
  key_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at TIMESTAMPTZ
);

-- Habilitar RLS e não criar políticas (nega todo acesso direto)
ALTER TABLE public.guardian_encryption_keys ENABLE ROW LEVEL SECURITY;

-- 2) Seed da chave inicial (usa a função existente)
INSERT INTO public.guardian_encryption_keys (key_version, key_text, is_active)
SELECT 1, public.get_cpf_encryption_key(), true
WHERE NOT EXISTS (SELECT 1 FROM public.guardian_encryption_keys);

-- 3) Adicionar coluna de versionamento na tabela guardians
ALTER TABLE public.guardians
ADD COLUMN IF NOT EXISTS cpf_key_version INTEGER;

-- Backfill de versão para linhas já criptografadas
UPDATE public.guardians
SET cpf_key_version = 1
WHERE cpf_encrypted IS NOT NULL AND cpf_key_version IS NULL;

-- 4) Atualizar função que retorna a chave ativa
CREATE OR REPLACE FUNCTION public.get_cpf_encryption_key()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT key_text 
  FROM public.guardian_encryption_keys
  WHERE is_active = true
  ORDER BY key_version DESC
  LIMIT 1
$function$;

-- Helper para retornar a versão ativa
CREATE OR REPLACE FUNCTION public.get_active_guardian_key_version()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT key_version
  FROM public.guardian_encryption_keys
  WHERE is_active = true
  ORDER BY key_version DESC
  LIMIT 1
$function$;

-- 5) Atualizar trigger de criptografia para salvar versão
CREATE OR REPLACE FUNCTION public.encrypt_guardian_cpf()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_key text;
  v_version integer;
BEGIN
  IF NEW.cpf IS NOT NULL AND btrim(NEW.cpf) <> '' THEN
    SELECT key_text, key_version
    INTO v_key, v_version
    FROM public.guardian_encryption_keys
    WHERE is_active = true
    ORDER BY key_version DESC
    LIMIT 1;

    IF v_key IS NULL THEN
      RAISE EXCEPTION 'Nenhuma chave ativa encontrada para criptografia';
    END IF;

    NEW.cpf_encrypted := pgp_sym_encrypt(NEW.cpf, v_key);
    NEW.cpf_key_version := v_version;
    NEW.cpf := NULL; -- remover plaintext em repouso
  END IF;
  RETURN NEW;
END;
$function$;

-- Garantir trigger ativa
DROP TRIGGER IF EXISTS trg_encrypt_guardian_cpf ON public.guardians;
CREATE TRIGGER trg_encrypt_guardian_cpf
BEFORE INSERT OR UPDATE OF cpf ON public.guardians
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_guardian_cpf();

-- 6) Atualizar RPC para aceitar motivo e usar versão por linha
CREATE OR REPLACE FUNCTION public.get_guardian_by_user(target_user_id uuid, access_reason text DEFAULT 'admin_view')
RETURNS TABLE(full_name text, email text, phone text, cpf text, relation_to_student text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  accessor uuid := auth.uid();
BEGIN
  -- Permitir apenas admins ou o próprio dono
  IF NOT (public.is_current_user_admin() OR accessor = target_user_id) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Registrar acesso com motivo
  INSERT INTO public.guardian_access_audit (accessor_user_id, target_user_id, reason)
  VALUES (accessor, target_user_id, access_reason);

  RETURN QUERY
  SELECT 
    g.full_name,
    g.email,
    g.phone,
    CASE 
      WHEN g.cpf_encrypted IS NOT NULL THEN convert_from(pgp_sym_decrypt(g.cpf_encrypted, k.key_text), 'UTF8')
      ELSE g.cpf
    END AS cpf,
    g.relation_to_student
  FROM public.guardians g
  LEFT JOIN public.guardian_encryption_keys k 
    ON k.key_version = g.cpf_key_version
  WHERE g.user_id = target_user_id
  LIMIT 1;
END;
$function$;

-- 7) Função de rotação de chaves com recriptografia
CREATE OR REPLACE FUNCTION public.rotate_guardian_cpf_key(new_key text, new_key_version integer DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_version integer;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem rotacionar a chave';
  END IF;

  IF new_key IS NULL OR btrim(new_key) = '' THEN
    RAISE EXCEPTION 'Nova chave inválida';
  END IF;

  IF new_key_version IS NULL THEN
    SELECT COALESCE(MAX(key_version), 0) + 1 INTO next_version
    FROM public.guardian_encryption_keys;
  ELSE
    next_version := new_key_version;
  END IF;

  -- Inserir nova chave
  INSERT INTO public.guardian_encryption_keys (key_version, key_text, is_active, created_at)
  VALUES (next_version, new_key, true, now());

  -- Desativar chaves anteriores
  UPDATE public.guardian_encryption_keys
  SET is_active = false, rotated_at = now()
  WHERE key_version <> next_version AND is_active = true;

  -- Recriptografar CPFs existentes para a nova chave
  UPDATE public.guardians g
  SET 
    cpf_encrypted = pgp_sym_encrypt(
      convert_from(
        pgp_sym_decrypt(g.cpf_encrypted, k.key_text),
        'UTF8'
      ), 
      new_key
    ),
    cpf_key_version = next_version,
    updated_at = now()
  FROM public.guardian_encryption_keys k
  WHERE g.cpf_encrypted IS NOT NULL
    AND k.key_version = g.cpf_key_version;

  RETURN true;
END;
$function$;