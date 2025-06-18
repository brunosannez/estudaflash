
-- 1. Truncar todas as tabelas de usuários (mantendo estrutura)
TRUNCATE TABLE public.quiz_respostas CASCADE;
TRUNCATE TABLE public.quiz_sessions CASCADE;
TRUNCATE TABLE public.flashcard_reviews CASCADE;
TRUNCATE TABLE public.daily_activities CASCADE;
TRUNCATE TABLE public.user_progress CASCADE;
TRUNCATE TABLE public.flashcards CASCADE;
TRUNCATE TABLE public.quizzes CASCADE;
TRUNCATE TABLE public.resumos CASCADE;
TRUNCATE TABLE public.uploads CASCADE;
TRUNCATE TABLE public.guardians CASCADE;
TRUNCATE TABLE public.user_profiles CASCADE;
TRUNCATE TABLE public.uso_usuarios CASCADE;
TRUNCATE TABLE public.usage_logs CASCADE;
TRUNCATE TABLE public.api_usage_tracking CASCADE;

-- 2. Resetar sequências se existirem
-- (Como usamos UUIDs, não há sequências para resetar)

-- 3. Verificar se as funções SQL estão funcionando corretamente
-- Testar função de setup de novo usuário
DO $$
BEGIN
  -- Verificar se a função handle_new_user_setup existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user_setup'
  ) THEN
    RAISE NOTICE 'Função handle_new_user_setup não encontrada - será necessário recriar';
  ELSE
    RAISE NOTICE 'Função handle_new_user_setup existe e está ativa';
  END IF;
END $$;

-- 4. Limpar dados de autenticação (CUIDADO: isso remove todos os usuários!)
-- IMPORTANTE: Isso vai deslogar todos os usuários
DELETE FROM auth.users;

-- 5. Verificar integridade dos planos
DO $$
DECLARE
  free_plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO free_plan_count 
  FROM public.plans 
  WHERE name = 'Free' AND is_active = true;
  
  IF free_plan_count = 0 THEN
    RAISE NOTICE 'Plano Free não encontrado - será necessário criar';
  ELSE
    RAISE NOTICE 'Plano Free existe e está ativo';
  END IF;
END $$;

-- 6. Garantir que existe pelo menos um plano Free ativo
INSERT INTO public.plans (
  name, description, price_brl, price_brl_yearly,
  uploads_limit, summaries_limit, flashcards_limit, quizzes_limit,
  quiz_model, summary_model, flashcard_model, is_active
) VALUES (
  'Free', 'Plano gratuito com limites básicos', 0, 0,
  10, 10, 10, 10,
  'GPT-3.5', 'Claude 3', 'DeepSeek-V2', true
) ON CONFLICT (name) DO UPDATE SET
  is_active = true,
  uploads_limit = 10,
  summaries_limit = 10,
  flashcards_limit = 10,
  quizzes_limit = 10;
