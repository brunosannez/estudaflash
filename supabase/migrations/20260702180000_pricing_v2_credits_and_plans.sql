-- ============================================================
-- PRECIFICAÇÃO V2 — créditos alinhados ao custo real de IA
-- ============================================================
-- Custos reais por ação (jul/2026, USD→BRL ~5,50):
--   ocr        Google Vision            ~R$0,008/imagem
--   summary    claude-sonnet-5          ~R$0,38/resumo
--   flashcards claude-haiku-4-5         ~R$0,07/geração
--   quiz       claude-sonnet-5          ~R$0,48/quiz
--   mind_map   claude-haiku-4-5         ~R$0,055/mapa
-- Alvo: ~R$0,05 de custo por crédito no pior caso, para o preço
-- dos planos carregar margem para marketing e manutenção.

-- 1) A constraint antiga só aceitava free/pro/edu — quebrava o
--    pós-pagamento de "Pro Max" (user_select_plan e verify-payment
--    gravam LOWER(name) na coluna plano)
ALTER TABLE public.uso_usuarios DROP CONSTRAINT IF EXISTS uso_usuarios_plano_check;

-- 2) Config de créditos com modelos/custos realmente em produção
UPDATE public.action_credits_config SET
  credits_per_action = 1,
  ai_provider = 'google',
  ai_model = 'vision-api',
  estimated_tokens = 0,
  cost_per_1k_tokens_usd = 0.0015
WHERE action_type = 'ocr';

UPDATE public.action_credits_config SET
  credits_per_action = 8,
  ai_provider = 'anthropic',
  ai_model = 'claude-sonnet-5',
  estimated_tokens = 11000,
  cost_per_1k_tokens_usd = 0.003
WHERE action_type = 'summary';

UPDATE public.action_credits_config SET
  credits_per_action = 3,
  ai_provider = 'anthropic',
  ai_model = 'claude-haiku-4-5',
  estimated_tokens = 5200,
  cost_per_1k_tokens_usd = 0.001
WHERE action_type = 'flashcards';

-- Quiz estava subsidiado: 5 créditos para a ação mais cara do sistema
UPDATE public.action_credits_config SET
  credits_per_action = 8,
  ai_provider = 'anthropic',
  ai_model = 'claude-sonnet-5',
  estimated_tokens = 9000,
  cost_per_1k_tokens_usd = 0.003
WHERE action_type = 'quiz';

UPDATE public.action_credits_config SET
  credits_per_action = 2,
  ai_provider = 'anthropic',
  ai_model = 'claude-haiku-4-5',
  estimated_tokens = 4000,
  cost_per_1k_tokens_usd = 0.001
WHERE action_type = 'mind_map';

-- 3) Planos com preços redondos e competitivos no mercado BR
--    (referências: Quizlet Plus ~R$32, Duolingo Super ~R$35)
UPDATE public.plans SET
  price_brl = 0,
  price_brl_yearly = 0,
  credits_per_month = 50,
  description = 'Para experimentar: ~2 sessões completas de estudo por mês',
  updated_at = now()
WHERE LOWER(name) = 'free';

UPDATE public.plans SET
  price_brl = 29.90,
  price_brl_yearly = 299.00,
  credits_per_month = 500,
  description = 'Para estudar toda semana: ~16 sessões completas por mês',
  updated_at = now()
WHERE LOWER(name) = 'pro';

-- A migration de créditos antiga mirava um plano "edu" inexistente:
-- Pro Max ficou sem credits_per_month e o preço antigo (R$86,58)
-- destoava do mercado
UPDATE public.plans SET
  price_brl = 54.90,
  price_brl_yearly = 549.00,
  credits_per_month = 1200,
  description = 'Para estudar todo dia: ~40 sessões completas por mês',
  updated_at = now()
WHERE LOWER(name) = 'pro max';

-- 4) Usuários de planos pagos que ficaram com créditos zerados pela
--    falha do "edu" recebem a carga do mês imediatamente
UPDATE public.uso_usuarios uu SET
  credits_remaining = GREATEST(uu.credits_remaining, p.credits_per_month - uu.credits_used_this_month),
  updated_at = now()
FROM public.plans p
WHERE uu.plan_id = p.id
  AND p.credits_per_month > 0
  AND uu.credits_remaining = 0
  AND uu.credits_used_this_month < p.credits_per_month;

-- 5) Suporte a cancelamento de assinatura: guardar o ID da subscription
--    do Stripe para poder cancelar via API
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- 6) SEGURANÇA/RECEITA: user_select_plan permitia ativar plano PAGO sem
--    pagar (qualquer usuário autenticado podia chamar o RPC direto ou
--    via /choose-plan). Agora só ativa planos gratuitos; pagos exigem
--    checkout Stripe (verify-payment é quem atualiza após pagamento).
CREATE OR REPLACE FUNCTION public.user_select_plan(new_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_price NUMERIC;
BEGIN
  SELECT price_brl INTO plan_price
  FROM public.plans
  WHERE id = new_plan_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plano nao encontrado ou inativo';
  END IF;

  IF plan_price > 0 THEN
    RAISE EXCEPTION 'Planos pagos devem ser ativados via checkout';
  END IF;

  UPDATE public.uso_usuarios
  SET
    plan_id = new_plan_id,
    plano = (SELECT LOWER(name) FROM public.plans WHERE id = new_plan_id),
    updated_at = now()
  WHERE user_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- 7) get_active_plans passa a expor credits_per_month para a UI mostrar
--    créditos em vez dos limites legados (que estão em 999999)
DROP FUNCTION IF EXISTS public.get_active_plans();
CREATE OR REPLACE FUNCTION public.get_active_plans()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price_brl numeric,
  price_brl_yearly numeric,
  credits_per_month integer,
  uploads_limit integer,
  summaries_limit integer,
  flashcards_limit integer,
  quizzes_limit integer,
  quiz_model text,
  summary_model text,
  flashcard_model text,
  features text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.name, p.description, p.price_brl, p.price_brl_yearly,
    p.credits_per_month,
    p.uploads_limit, p.summaries_limit, p.flashcards_limit, p.quizzes_limit,
    p.quiz_model, p.summary_model, p.flashcard_model, p.features
  FROM public.plans p
  WHERE p.is_active = true
  ORDER BY p.price_brl ASC;
END;
$function$;
