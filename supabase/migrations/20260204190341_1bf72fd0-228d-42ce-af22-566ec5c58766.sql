-- Dropar funções existentes para recriá-las com novos campos
DROP FUNCTION IF EXISTS get_all_users_admin();
DROP FUNCTION IF EXISTS admin_toggle_user_status(uuid, boolean);
DROP FUNCTION IF EXISTS admin_block_user(uuid, text);
DROP FUNCTION IF EXISTS admin_unblock_user(uuid);
DROP FUNCTION IF EXISTS get_all_subscriptions_admin();
DROP FUNCTION IF EXISTS get_subscription_stats();

-- Adicionar campos de status/bloqueio na tabela uso_usuarios
ALTER TABLE uso_usuarios ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE uso_usuarios ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE uso_usuarios ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para buscar usuários inativos/bloqueados rapidamente
CREATE INDEX IF NOT EXISTS idx_uso_usuarios_is_active ON uso_usuarios(is_active);

-- Função atualizada get_all_users_admin com novos campos
CREATE OR REPLACE FUNCTION get_all_users_admin()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  plano TEXT,
  uploads_realizados INTEGER,
  flashcards_gerados INTEGER,
  quizzes_realizados INTEGER,
  storage_mb NUMERIC,
  created_at TIMESTAMPTZ,
  is_admin BOOLEAN,
  is_active BOOLEAN,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.user_id,
    COALESCE(au.email, 'Email não disponível') AS email,
    COALESCE(u.plano, 'free') AS plano,
    COALESCE(u.uploads_realizados, 0) AS uploads_realizados,
    COALESCE(u.flashcards_gerados, 0) AS flashcards_gerados,
    COALESCE(u.quizzes_realizados, 0) AS quizzes_realizados,
    COALESCE(
      (SELECT SUM(file_size) / 1024.0 / 1024.0 FROM uploads WHERE uploads.user_id = u.user_id), 
      0
    )::NUMERIC AS storage_mb,
    u.created_at,
    COALESCE(u.is_admin, false) AS is_admin,
    COALESCE(u.is_active, true) AS is_active,
    u.blocked_reason,
    u.blocked_at
  FROM uso_usuarios u
  LEFT JOIN auth.users au ON u.user_id = au.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Função para bloquear usuário com motivo
CREATE OR REPLACE FUNCTION admin_block_user(
  target_user_id UUID,
  block_reason TEXT DEFAULT 'Bloqueado pelo administrador'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  UPDATE uso_usuarios
  SET 
    is_active = false,
    blocked_reason = block_reason,
    blocked_at = NOW()
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para desbloquear usuário
CREATE OR REPLACE FUNCTION admin_unblock_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  UPDATE uso_usuarios
  SET 
    is_active = true,
    blocked_reason = NULL,
    blocked_at = NULL
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função admin_toggle_user_status atualizada
CREATE OR REPLACE FUNCTION admin_toggle_user_status(
  target_user_id UUID,
  new_is_active BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  UPDATE uso_usuarios
  SET 
    is_active = new_is_active,
    blocked_reason = CASE WHEN new_is_active THEN NULL ELSE blocked_reason END,
    blocked_at = CASE WHEN new_is_active THEN NULL ELSE COALESCE(blocked_at, NOW()) END
  WHERE user_id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Função para buscar assinaturas com detalhes (para admin)
CREATE OR REPLACE FUNCTION get_all_subscriptions_admin()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  plan_id UUID,
  plan_name TEXT,
  amount_paid_brl NUMERIC,
  payment_method TEXT,
  start_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    COALESCE(au.email, 'Email não disponível') AS user_email,
    s.plan_id,
    COALESCE(p.name, 'Plano removido') AS plan_name,
    s.amount_paid_brl,
    s.payment_method,
    s.start_date,
    s.renewal_date,
    s.status,
    s.created_at
  FROM subscriptions s
  LEFT JOIN auth.users au ON s.user_id = au.id
  LEFT JOIN plans p ON s.plan_id = p.id
  ORDER BY s.created_at DESC;
END;
$$;

-- Função para estatísticas de assinaturas
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  active_count BIGINT,
  canceled_count BIGINT,
  pending_count BIGINT,
  total_revenue NUMERIC,
  mrr NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_current_user_admin() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não é administrador';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'active') AS active_count,
    COUNT(*) FILTER (WHERE status = 'canceled') AS canceled_count,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COALESCE(SUM(amount_paid_brl), 0) AS total_revenue,
    COALESCE(SUM(amount_paid_brl) FILTER (WHERE status = 'active'), 0) AS mrr
  FROM subscriptions;
END;
$$;