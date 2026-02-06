
-- Drop and recreate get_all_users_admin with explicit ownership and better error handling
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
  -- Verify current user is admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.user_id,
    COALESCE(au.email, u.user_id::text) AS email,
    COALESCE(u.plano, 'free') AS plano,
    COALESCE(u.uploads_realizados, 0) AS uploads_realizados,
    COALESCE(u.flashcards_gerados, 0) AS flashcards_gerados,
    COALESCE(u.quizzes_realizados, 0) AS quizzes_realizados,
    COALESCE(
      (SELECT SUM(upl.file_size) / 1024.0 / 1024.0 FROM public.uploads upl WHERE upl.user_id = u.user_id), 
      0
    )::NUMERIC AS storage_mb,
    u.created_at,
    COALESCE(u.is_admin, false) AS is_admin,
    COALESCE(u.is_active, true) AS is_active,
    u.blocked_reason,
    u.blocked_at
  FROM public.uso_usuarios u
  LEFT JOIN auth.users au ON u.user_id = au.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Ensure the function is owned by postgres for auth.users access
ALTER FUNCTION public.get_all_users_admin() OWNER TO postgres;
