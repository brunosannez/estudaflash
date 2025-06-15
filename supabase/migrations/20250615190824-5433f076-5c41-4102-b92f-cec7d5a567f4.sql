
-- Corrigir a função is_current_user_admin para usar a tabela uso_usuarios
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.uso_usuarios 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Atualizar função get_all_users_admin com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  plano text, 
  created_at timestamp with time zone, 
  uploads_realizados integer, 
  flashcards_gerados integer, 
  quizzes_realizados integer, 
  is_admin boolean, 
  storage_mb numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar lista de usuários';
  END IF;
  
  RETURN QUERY
  SELECT 
    uu.user_id,
    COALESCE(au.email, 'Email não disponível') as email,
    uu.plano,
    uu.created_at,
    uu.uploads_realizados,
    uu.flashcards_gerados,
    uu.quizzes_realizados,
    uu.is_admin,
    COALESCE(storage_data.total_mb, 0) as storage_mb
  FROM public.uso_usuarios uu
  LEFT JOIN auth.users au ON uu.user_id = au.id
  LEFT JOIN (
    SELECT 
      user_id,
      SUM(file_size) / 1024.0 / 1024.0 as total_mb
    FROM public.uploads 
    GROUP BY user_id
  ) storage_data ON uu.user_id = storage_data.user_id
  ORDER BY uu.created_at DESC;
END;
$$;

-- Criar função para obter estatísticas do sistema com melhor performance
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(
  total_users bigint, 
  total_storage_mb numeric, 
  active_users_7_days bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar estatísticas';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.uso_usuarios) as total_users,
    (SELECT COALESCE(SUM(file_size), 0) / 1024.0 / 1024.0 FROM public.uploads) as total_storage_mb,
    (SELECT COUNT(DISTINCT user_id) FROM public.daily_activities 
     WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days') as active_users_7_days;
END;
$$;
