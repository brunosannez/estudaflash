
-- Recriar a função get_all_users_admin com casts explícitos para resolver type mismatch
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(
  user_id uuid,
  email text,
  plano text,
  uploads_realizados integer,
  flashcards_gerados integer,
  quizzes_realizados integer,
  storage_mb numeric,
  created_at timestamp with time zone,
  is_admin boolean,
  is_active boolean,
  blocked_reason text,
  blocked_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;

  RETURN QUERY
  SELECT
    u.user_id,
    COALESCE(au.email::text, u.user_id::text) AS email,
    COALESCE(u.plano, 'free')::text AS plano,
    COALESCE(u.uploads_realizados, 0)::integer AS uploads_realizados,
    COALESCE(u.flashcards_gerados, 0)::integer AS flashcards_gerados,
    COALESCE(u.quizzes_realizados, 0)::integer AS quizzes_realizados,
    COALESCE(s.total_storage, 0)::numeric AS storage_mb,
    u.created_at,
    COALESCE(u.is_admin, false)::boolean AS is_admin,
    COALESCE(u.is_active, true)::boolean AS is_active,
    u.blocked_reason::text AS blocked_reason,
    u.blocked_at
  FROM public.uso_usuarios u
  LEFT JOIN auth.users au ON u.user_id = au.id
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(
      CASE 
        WHEN up.file_size IS NOT NULL THEN up.file_size / (1024.0 * 1024.0)
        ELSE 0
      END
    ), 0) AS total_storage
    FROM public.uploads up
    WHERE up.user_id = u.user_id
  ) s ON true
  ORDER BY u.created_at DESC;
END;
$$;

-- Garantir owner correto
ALTER FUNCTION public.get_all_users_admin() OWNER TO postgres;
