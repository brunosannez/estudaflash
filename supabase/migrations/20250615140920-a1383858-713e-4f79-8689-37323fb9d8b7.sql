
-- Add is_admin column to uso_usuarios table (our user management table)
ALTER TABLE public.uso_usuarios 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.uso_usuarios 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$$;

-- Function for admins to promote users to admin
CREATE OR REPLACE FUNCTION public.admin_promote_user(
  target_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem promover usuários';
  END IF;
  
  -- Find user by email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com email: %', target_email;
  END IF;
  
  -- Update user to admin
  UPDATE public.uso_usuarios 
  SET is_admin = true, updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function for admins to reset user usage
CREATE OR REPLACE FUNCTION public.admin_reset_user_usage(
  target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem resetar uso de usuários';
  END IF;
  
  -- Reset usage counters
  UPDATE public.uso_usuarios 
  SET 
    uploads_realizados = 0,
    flashcards_gerados = 0,
    quizzes_realizados = 0,
    data_ultimo_reset = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function for admins to delete all user data
CREATE OR REPLACE FUNCTION public.admin_delete_user_data(
  target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar dados de usuários';
  END IF;
  
  -- Delete in order to respect foreign key constraints
  DELETE FROM public.quiz_respostas WHERE user_id = target_user_id;
  DELETE FROM public.quiz_sessions WHERE user_id = target_user_id;
  DELETE FROM public.flashcard_reviews WHERE user_id = target_user_id;
  DELETE FROM public.daily_activities WHERE user_id = target_user_id;
  DELETE FROM public.user_progress WHERE user_id = target_user_id;
  
  -- Delete flashcards and quizzes related to user's uploads
  DELETE FROM public.flashcards WHERE resumo_id IN (
    SELECT r.id FROM public.resumos r 
    INNER JOIN public.uploads u ON r.upload_id = u.id 
    WHERE u.user_id = target_user_id
  );
  
  DELETE FROM public.quizzes WHERE resumo_id IN (
    SELECT r.id FROM public.resumos r 
    INNER JOIN public.uploads u ON r.upload_id = u.id 
    WHERE u.user_id = target_user_id
  );
  
  -- Delete resumos related to user's uploads
  DELETE FROM public.resumos WHERE upload_id IN (
    SELECT id FROM public.uploads WHERE user_id = target_user_id
  );
  
  -- Delete uploads
  DELETE FROM public.uploads WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE(
  total_users BIGINT,
  total_storage_mb NUMERIC,
  active_users_7_days BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Function to get all users with details for admin panel
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  plano TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  uploads_realizados INTEGER,
  flashcards_gerados INTEGER,
  quizzes_realizados INTEGER,
  is_admin BOOLEAN,
  storage_mb NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar lista de usuários';
  END IF;
  
  RETURN QUERY
  SELECT 
    uu.user_id,
    au.email,
    uu.plano,
    uu.created_at,
    uu.uploads_realizados,
    uu.flashcards_gerados,
    uu.quizzes_realizados,
    uu.is_admin,
    COALESCE(storage_data.total_mb, 0) as storage_mb
  FROM public.uso_usuarios uu
  INNER JOIN auth.users au ON uu.user_id = au.id
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

-- Add file_size column to uploads table if it doesn't exist
ALTER TABLE public.uploads 
ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0;
