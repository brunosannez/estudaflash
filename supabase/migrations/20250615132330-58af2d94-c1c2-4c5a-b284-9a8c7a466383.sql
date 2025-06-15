
-- Create function to get user storage usage
CREATE OR REPLACE FUNCTION public.get_user_storage_usage(user_uuid uuid)
RETURNS TABLE (
  total_files bigint,
  total_size_bytes bigint,
  total_size_mb numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_files,
    COALESCE(SUM(file_size), 0)::bigint as total_size_bytes,
    ROUND(COALESCE(SUM(file_size), 0) / 1024.0 / 1024.0, 2) as total_size_mb
  FROM public.uploads 
  WHERE user_id = user_uuid;
END;
$$;
