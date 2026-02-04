-- =============================================
-- FASE 1: CORRIGIR RLS DA TABELA admin_users
-- Problema: Recursão infinita na política RLS
-- =============================================

-- Remover TODAS as políticas problemáticas da tabela admin_users
DROP POLICY IF EXISTS "Admins can manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view all admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users only" ON public.admin_users;

-- Criar nova política sem recursão (usa uso_usuarios.is_admin em vez de admin_users)
CREATE POLICY "Admins can access admin_users"
ON public.admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.uso_usuarios 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- =============================================
-- FASE 3: CORRIGIR FUNÇÃO get_usage_analytics
-- Problema: Lê de usage_logs (vazia) ao invés de credits_usage_log
-- =============================================

-- Dropar função existente para recriar com correção
DROP FUNCTION IF EXISTS public.get_usage_analytics(date, date);

-- Recriar função para usar a tabela correta
CREATE OR REPLACE FUNCTION public.get_usage_analytics(
  start_date date DEFAULT (CURRENT_DATE - '30 days'::interval),
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  action_type text,
  usage_date date,
  total_actions bigint,
  unique_users bigint,
  total_credits bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem acessar analytics de uso';
  END IF;
  
  RETURN QUERY
  SELECT 
    cul.action_type::text,
    cul.created_at::DATE as usage_date,
    COUNT(*)::bigint as total_actions,
    COUNT(DISTINCT cul.user_id)::bigint as unique_users,
    COALESCE(SUM(cul.credits_consumed), 0)::bigint as total_credits
  FROM public.credits_usage_log cul
  WHERE cul.created_at::DATE >= start_date 
    AND cul.created_at::DATE <= end_date
  GROUP BY cul.action_type, cul.created_at::DATE
  ORDER BY usage_date DESC, action_type;
END;
$$;

-- =============================================
-- FASE 2: CRIAR FUNÇÃO log_api_usage HELPER
-- Para ser chamada pelas edge functions
-- =============================================

CREATE OR REPLACE FUNCTION public.log_api_usage(
  target_user_id uuid,
  target_api_provider text,
  target_action_type text,
  target_tokens_used integer,
  target_estimated_cost_usd numeric,
  target_model_used text,
  target_success boolean DEFAULT true,
  target_error_message text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.api_usage_tracking (
    user_id,
    api_provider,
    action_type,
    tokens_used,
    estimated_cost_usd,
    model_used,
    success,
    error_message,
    timestamp
  ) VALUES (
    target_user_id,
    target_api_provider,
    target_action_type,
    target_tokens_used,
    target_estimated_cost_usd,
    target_model_used,
    target_success,
    target_error_message,
    NOW()
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log but don't fail the main operation
    RAISE WARNING 'Failed to log API usage: %', SQLERRM;
    RETURN false;
END;
$$;