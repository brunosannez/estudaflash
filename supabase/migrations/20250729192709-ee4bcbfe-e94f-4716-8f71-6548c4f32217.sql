-- Fase 1: Correções de Segurança e Banco

-- 1. Corrigir função de verificação de admin com search_path seguro
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.uso_usuarios 
    WHERE user_id = auth.uid() AND is_admin = true
  );
END;
$function$;

-- 2. Atualizar função handle_new_user_setup com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta_data JSONB;
  guardian_data JSONB;
  selected_plan_id UUID;
  default_plan_id UUID;
  plan_name_text TEXT;
BEGIN
  meta_data := NEW.raw_user_meta_data;
  
  -- 1. Insert into user_profiles (incluindo username)
  IF meta_data ? 'full_name' AND meta_data ? 'date_of_birth' THEN
    INSERT INTO public.user_profiles (user_id, full_name, date_of_birth, school_year, is_minor, username)
    VALUES (
      NEW.id,
      meta_data->>'full_name',
      (meta_data->>'date_of_birth')::date,
      meta_data->>'school_year',
      (meta_data->>'is_minor')::boolean,
      meta_data->>'username'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      date_of_birth = EXCLUDED.date_of_birth,
      school_year = EXCLUDED.school_year,
      is_minor = EXCLUDED.is_minor,
      username = EXCLUDED.username,
      updated_at = now();
  END IF;

  -- 2. Insert into guardians if user is a minor and guardian data exists
  IF (meta_data->>'is_minor')::boolean IS TRUE AND meta_data ? 'guardian' THEN
    guardian_data := meta_data->'guardian';
    IF guardian_data IS NOT NULL AND guardian_data != 'null'::jsonb THEN
      INSERT INTO public.guardians (user_id, full_name, email, phone, cpf, relation_to_student)
      VALUES (
        NEW.id,
        guardian_data->>'full_name',
        guardian_data->>'email',
        guardian_data->>'phone',
        guardian_data->>'cpf',
        guardian_data->>'relation_to_student'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        cpf = EXCLUDED.cpf,
        relation_to_student = EXCLUDED.relation_to_student,
        updated_at = now();
    END IF;
  END IF;

  -- 3. Insert into uso_usuarios (usage data)
  -- Check if plan_id is provided in user metadata
  IF meta_data ? 'plan_id' AND meta_data->>'plan_id' IS NOT NULL AND meta_data->>'plan_id' != '' THEN
     selected_plan_id := (meta_data->>'plan_id')::UUID;
  END IF;
  
  -- If no plan_id in metadata, find Free plan
  IF selected_plan_id IS NULL THEN
    SELECT id INTO default_plan_id
    FROM public.plans 
    WHERE LOWER(name) = 'free' AND is_active = true
    LIMIT 1;
    
    -- If no 'Free' plan, get the cheapest active plan
    IF default_plan_id IS NULL THEN
      SELECT id INTO default_plan_id
      FROM public.plans 
      WHERE is_active = true
      ORDER BY price_brl ASC
      LIMIT 1;
    END IF;
    
    selected_plan_id := default_plan_id;
  END IF;
  
  -- If still no plan, create a default free plan
  IF selected_plan_id IS NULL THEN
    INSERT INTO public.plans (
      name, description, price_brl, price_brl_yearly,
      uploads_limit, summaries_limit, flashcards_limit, quizzes_limit,
      quiz_model, summary_model, flashcard_model, 
      features, is_active, is_editable
    ) VALUES (
      'Free', 'Plano gratuito básico', 0, 0,
      10, 10, 10, 10,
      'GPT-3.5', 'Claude 3', 'DeepSeek-V2',
      ARRAY['10 uploads por mês', '10 resumos', '10 flashcards', '10 quizzes'],
      true, false
    )
    RETURNING id INTO selected_plan_id;
  END IF;

  -- Get plan name for 'plano' column
  SELECT LOWER(name) INTO plan_name_text FROM public.plans WHERE id = selected_plan_id;
  
  -- Insert user usage record
  INSERT INTO public.uso_usuarios (
    user_id, 
    plan_id, 
    plano, 
    uploads_realizados, 
    flashcards_gerados, 
    quizzes_realizados,
    is_admin
  )
  VALUES (
    NEW.id, 
    selected_plan_id, 
    COALESCE(plan_name_text, 'free'),
    0, 
    0, 
    0,
    false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    plano = EXCLUDED.plano,
    updated_at = now();

  -- 4. Initialize user progress
  INSERT INTO public.user_progress (
    user_id,
    total_xp,
    current_level,
    current_streak,
    longest_streak
  )
  VALUES (
    NEW.id,
    0,
    1,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3. Criar plano Free padrão se não existir
INSERT INTO public.plans (
  name, description, price_brl, price_brl_yearly,
  uploads_limit, summaries_limit, flashcards_limit, quizzes_limit,
  quiz_model, summary_model, flashcard_model, 
  features, is_active, is_editable
) VALUES (
  'Free', 'Plano gratuito com recursos básicos para estudar', 0, 0,
  10, 10, 10, 10,
  'GPT-3.5', 'Claude 3', 'DeepSeek-V2',
  ARRAY[
    '10 uploads de imagens por mês',
    '10 resumos gerados',
    '10 conjuntos de flashcards',
    '10 quizzes interativos',
    'Extração de texto de imagens',
    'Sistema de gamificação básico'
  ],
  true, false
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_active = true,
  updated_at = now();

-- 4. Criar plano Pro
INSERT INTO public.plans (
  name, description, price_brl, price_brl_yearly,
  uploads_limit, summaries_limit, flashcards_limit, quizzes_limit,
  quiz_model, summary_model, flashcard_model, 
  features, is_active, is_editable
) VALUES (
  'Pro', 'Plano profissional com recursos avançados', 29.90, 299.00,
  100, 100, 100, 100,
  'GPT-4o', 'Claude 3.5', 'GPT-3.5',
  ARRAY[
    '100 uploads de imagens por mês',
    '100 resumos com IA avançada',
    '100 conjuntos de flashcards',
    '100 quizzes interativos',
    'Mapas mentais automáticos',
    'Análise de progresso detalhada',
    'Suporte prioritário',
    'Modelos de IA mais avançados'
  ],
  true, true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_brl = EXCLUDED.price_brl,
  price_brl_yearly = EXCLUDED.price_brl_yearly,
  uploads_limit = EXCLUDED.uploads_limit,
  summaries_limit = EXCLUDED.summaries_limit,
  flashcards_limit = EXCLUDED.flashcards_limit,
  quizzes_limit = EXCLUDED.quizzes_limit,
  quiz_model = EXCLUDED.quiz_model,
  summary_model = EXCLUDED.summary_model,
  flashcard_model = EXCLUDED.flashcard_model,
  features = EXCLUDED.features,
  is_active = true,
  updated_at = now();

-- 5. Criar plano Edu
INSERT INTO public.plans (
  name, description, price_brl, price_brl_yearly,
  uploads_limit, summaries_limit, flashcards_limit, quizzes_limit,
  quiz_model, summary_model, flashcard_model, 
  features, is_active, is_editable
) VALUES (
  'Edu', 'Plano educacional com recursos ilimitados', 59.90, 599.00,
  -1, -1, -1, -1,
  'GPT-4o', 'Claude 3.5', 'GPT-4o',
  ARRAY[
    'Uploads ilimitados',
    'Resumos ilimitados',
    'Flashcards ilimitados',
    'Quizzes ilimitados',
    'Mapas mentais avançados',
    'Analytics completo',
    'Integração com LMS',
    'API para desenvolvedores',
    'Suporte 24/7',
    'Modelos de IA premium'
  ],
  true, true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_brl = EXCLUDED.price_brl,
  price_brl_yearly = EXCLUDED.price_brl_yearly,
  uploads_limit = EXCLUDED.uploads_limit,
  summaries_limit = EXCLUDED.summaries_limit,
  flashcards_limit = EXCLUDED.flashcards_limit,
  quizzes_limit = EXCLUDED.quizzes_limit,
  quiz_model = EXCLUDED.quiz_model,
  summary_model = EXCLUDED.summary_model,
  flashcard_model = EXCLUDED.flashcard_model,
  features = EXCLUDED.features,
  is_active = true,
  updated_at = now();