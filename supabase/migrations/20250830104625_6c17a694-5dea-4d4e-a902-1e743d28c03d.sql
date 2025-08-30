-- Fix the consume_credits function - resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.consume_credits(target_user_id uuid, action_type text)
RETURNS TABLE(success boolean, credits_consumed integer, credits_remaining integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  config_record RECORD;
  user_credits INTEGER;
  consumed_credits INTEGER;
BEGIN
  -- Buscar configuração da ação
  SELECT * INTO config_record
  FROM public.action_credits_config acc
  WHERE acc.action_type = consume_credits.action_type;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Tipo de ação não encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Buscar créditos do usuário - usar alias para evitar ambiguidade
  SELECT uu.credits_remaining INTO user_credits
  FROM public.uso_usuarios uu
  WHERE uu.user_id = target_user_id;
  
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
  
  -- Consumir créditos - usar alias para evitar ambiguidade
  UPDATE public.uso_usuarios uu
  SET 
    credits_remaining = uu.credits_remaining - consumed_credits,
    credits_used_this_month = uu.credits_used_this_month + consumed_credits,
    updated_at = now()
  WHERE uu.user_id = target_user_id;
  
  RETURN QUERY SELECT TRUE, consumed_credits, (user_credits - consumed_credits), 'Créditos consumidos com sucesso'::TEXT;
END;
$$;