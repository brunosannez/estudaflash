-- Corrigir problemas de segurança detectados pelo linter

-- 1. Corrigir funções sem search_path
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.uso_usuarios uu
  SET 
    credits_remaining = p.credits_per_month,
    credits_used_this_month = 0,
    last_credits_reset = CURRENT_DATE,
    updated_at = now()
  FROM public.plans p
  WHERE uu.plan_id = p.id
    AND uu.last_credits_reset < CURRENT_DATE - INTERVAL '30 days';
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_credits(
  target_user_id UUID,
  action_type TEXT
) RETURNS TABLE(
  success BOOLEAN,
  credits_consumed INTEGER,
  credits_remaining INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_record RECORD;
  user_credits INTEGER;
  consumed_credits INTEGER;
BEGIN
  -- Buscar configuração da ação
  SELECT * INTO config_record
  FROM public.action_credits_config
  WHERE action_credits_config.action_type = consume_credits.action_type;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Tipo de ação não encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Buscar créditos do usuário
  SELECT credits_remaining INTO user_credits
  FROM public.uso_usuarios
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Usuário não encontrado'::TEXT;
    RETURN;
  END IF;
  
  consumed_credits := config_record.credits_per_action;
  
  -- Verificar se tem créditos suficientes
  IF user_credits < consumed_credits THEN
    RETURN QUERY SELECT FALSE, 0, user_credits, 'Créditos insuficientes'::TEXT;
    RETURN;
  END IF;
  
  -- Consumir créditos
  UPDATE public.uso_usuarios
  SET 
    credits_remaining = credits_remaining - consumed_credits,
    credits_used_this_month = credits_used_this_month + consumed_credits,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN QUERY SELECT TRUE, consumed_credits, (user_credits - consumed_credits), 'Créditos consumidos com sucesso'::TEXT;
END;
$$;