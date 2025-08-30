-- Atualizar estrutura da tabela plans para sistema de créditos
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS credits_per_month integer DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS credits_cost_brl numeric(10,4) DEFAULT 0.0000;

-- Atualizar planos existentes com sistema de créditos
-- Baseado nos custos reais das APIs + 60% de margem de lucro

-- FREE: 50 créditos (suficiente para ~5 resumos + flashcards + quiz)
UPDATE public.plans 
SET 
  credits_per_month = 50,
  credits_cost_brl = 0.0000,
  uploads_limit = 999999, -- Remove limitação de upload
  summaries_limit = 999999,
  flashcards_limit = 999999,
  quizzes_limit = 999999
WHERE LOWER(name) = 'free';

-- PRO: 500 créditos (suficiente para ~50 resumos + flashcards + quiz)
UPDATE public.plans 
SET 
  credits_per_month = 500,
  credits_cost_brl = 29.90,
  uploads_limit = 999999, -- Remove limitação de upload
  summaries_limit = 999999,
  flashcards_limit = 999999,
  quizzes_limit = 999999
WHERE LOWER(name) = 'pro';

-- EDU: 2000 créditos (suficiente para ~200 resumos + flashcards + quiz)
UPDATE public.plans 
SET 
  credits_per_month = 2000,
  credits_cost_brl = 79.90,
  uploads_limit = 999999, -- Remove limitação de upload
  summaries_limit = 999999,
  flashcards_limit = 999999,
  quizzes_limit = 999999
WHERE LOWER(name) = 'edu';

-- Criar tabela para configuração de custos de créditos por ação
CREATE TABLE IF NOT EXISTS public.action_credits_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL UNIQUE,
  credits_per_action INTEGER NOT NULL,
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  estimated_tokens INTEGER DEFAULT 0,
  cost_per_1k_tokens_usd NUMERIC(10,6) DEFAULT 0.000000,
  profit_margin_percentage NUMERIC(5,2) DEFAULT 60.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações de créditos por ação
INSERT INTO public.action_credits_config (action_type, credits_per_action, ai_provider, ai_model, estimated_tokens, cost_per_1k_tokens_usd) VALUES
-- OCR (Google Vision) - 1 crédito por imagem
('ocr', 1, 'google', 'vision-api', 0, 0.0015),

-- Resumo (Claude 3.5 Sonnet) - 8 créditos (input ~3k tokens, output ~1k tokens)
('summary', 8, 'anthropic', 'claude-3-5-sonnet-20241022', 4000, 0.003),

-- Flashcards (DeepSeek-V2 via HuggingFace) - 3 créditos (mais barato)  
('flashcards', 3, 'huggingface', 'deepseek-ai/DeepSeek-V2-Chat', 2000, 0.0008),

-- Quiz (GPT-4o-mini) - 5 créditos (intermediário)
('quiz', 5, 'openai', 'gpt-4o-mini', 3000, 0.0006);

-- Atualizar tabela uso_usuarios para incluir créditos
ALTER TABLE public.uso_usuarios ADD COLUMN IF NOT EXISTS credits_remaining integer DEFAULT 0;
ALTER TABLE public.uso_usuarios ADD COLUMN IF NOT EXISTS credits_used_this_month integer DEFAULT 0;
ALTER TABLE public.uso_usuarios ADD COLUMN IF NOT EXISTS last_credits_reset date DEFAULT CURRENT_DATE;

-- Migrar usuários existentes para sistema de créditos baseado no plano atual
UPDATE public.uso_usuarios 
SET credits_remaining = CASE 
  WHEN plano = 'free' THEN 50
  WHEN plano = 'pro' THEN 500  
  WHEN plano = 'edu' THEN 2000
  ELSE 50
END,
credits_used_this_month = 0,
last_credits_reset = CURRENT_DATE
WHERE credits_remaining IS NULL OR credits_remaining = 0;

-- Função para resetar créditos mensalmente
CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Função para decrementar créditos por ação
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

-- Tabela para log de consumo de créditos
CREATE TABLE IF NOT EXISTS public.credits_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  credits_consumed INTEGER NOT NULL,
  credits_remaining_after INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies para credits_usage_log
ALTER TABLE public.credits_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits usage" ON public.credits_usage_log
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert credits usage" ON public.credits_usage_log
FOR INSERT WITH CHECK (true);

-- RLS policies para action_credits_config (somente leitura para todos)
ALTER TABLE public.action_credits_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view credits config" ON public.action_credits_config
FOR SELECT USING (true);

CREATE POLICY "Only admins can modify credits config" ON public.action_credits_config
FOR ALL USING (is_current_user_admin());