
-- Criar função otimizada para estatísticas de gerenciamento de dados
CREATE OR REPLACE FUNCTION public.get_data_management_stats()
RETURNS TABLE(
  total_files bigint,
  total_storage_mb numeric,
  average_storage_per_user numeric,
  total_users bigint,
  files_older_than_30_days bigint,
  files_older_than_7_days bigint,
  active_users_30_days bigint,
  largest_file_size_mb numeric,
  storage_by_plan jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar estatísticas de dados';
  END IF;
  
  RETURN QUERY
  WITH upload_stats AS (
    SELECT 
      COUNT(*) as file_count,
      COALESCE(SUM(file_size), 0) as total_bytes,
      COALESCE(SUM(file_size), 0) / 1024.0 / 1024.0 as total_mb,
      COALESCE(MAX(file_size), 0) / 1024.0 / 1024.0 as max_file_mb
    FROM public.uploads
  ),
  user_stats AS (
    SELECT COUNT(*) as user_count
    FROM public.uso_usuarios
  ),
  old_files AS (
    SELECT 
      COUNT(*) FILTER (WHERE data_upload < CURRENT_DATE - INTERVAL '30 days') as files_30_days,
      COUNT(*) FILTER (WHERE data_upload < CURRENT_DATE - INTERVAL '7 days') as files_7_days
    FROM public.uploads
  ),
  active_users AS (
    SELECT COUNT(DISTINCT user_id) as active_count
    FROM public.uploads 
    WHERE data_upload >= CURRENT_DATE - INTERVAL '30 days'
  ),
  storage_by_plan_stats AS (
    SELECT 
      jsonb_object_agg(
        uu.plano,
        jsonb_build_object(
          'storage_mb', COALESCE(SUM(u.file_size), 0) / 1024.0 / 1024.0,
          'user_count', COUNT(DISTINCT uu.user_id),
          'file_count', COUNT(u.id)
        )
      ) as plan_stats
    FROM public.uso_usuarios uu
    LEFT JOIN public.uploads u ON uu.user_id = u.user_id
    GROUP BY ()
  )
  SELECT 
    us.file_count,
    us.total_mb,
    CASE WHEN user_stats.user_count > 0 THEN us.total_mb / user_stats.user_count ELSE 0 END,
    user_stats.user_count,
    old_files.files_30_days,
    old_files.files_7_days,
    active_users.active_count,
    us.max_file_mb,
    COALESCE(storage_by_plan_stats.plan_stats, '{}'::jsonb)
  FROM upload_stats us
  CROSS JOIN user_stats
  CROSS JOIN old_files
  CROSS JOIN active_users
  CROSS JOIN storage_by_plan_stats;
END;
$$;

-- Criar função para limpeza automática de arquivos antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_files(days_threshold integer DEFAULT 30)
RETURNS TABLE(
  deleted_files integer,
  freed_storage_mb numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count integer := 0;
  freed_bytes bigint := 0;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem executar limpeza de arquivos';
  END IF;
  
  -- Get stats before deletion
  SELECT 
    COUNT(*),
    COALESCE(SUM(file_size), 0)
  INTO deleted_count, freed_bytes
  FROM public.uploads 
  WHERE data_upload < CURRENT_DATE - INTERVAL '1 day' * days_threshold;
  
  -- Delete old uploads (cascades to related data)
  DELETE FROM public.uploads 
  WHERE data_upload < CURRENT_DATE - INTERVAL '1 day' * days_threshold;
  
  RETURN QUERY
  SELECT 
    deleted_count,
    freed_bytes / 1024.0 / 1024.0;
END;
$$;

-- Habilitar realtime para as tabelas relevantes
ALTER TABLE public.uploads REPLICA IDENTITY FULL;
ALTER TABLE public.uso_usuarios REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.uploads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uso_usuarios;
