-- Fase 3: Criar primeiro admin e verificar dados
-- Verificar se existe admin e criar um se necessário
DO $$
DECLARE
  admin_exists boolean;
  test_user_id uuid;
BEGIN
  -- Verificar se já existe algum admin
  SELECT EXISTS (
    SELECT 1 FROM public.uso_usuarios WHERE is_admin = true
  ) INTO admin_exists;
  
  -- Se não há admin, tentar promover primeiro usuário ou criar instruções
  IF NOT admin_exists THEN
    -- Tentar pegar primeiro usuário criado
    SELECT user_id INTO test_user_id 
    FROM public.uso_usuarios 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se existe usuário, promover para admin
    IF test_user_id IS NOT NULL THEN
      UPDATE public.uso_usuarios 
      SET is_admin = true, updated_at = now()
      WHERE user_id = test_user_id;
      
      RAISE NOTICE 'Primeiro usuário promovido a admin: %', test_user_id;
    ELSE
      RAISE NOTICE 'Nenhum usuário encontrado. O primeiro usuário que se registrar será automaticamente admin.';
    END IF;
  END IF;
END $$;

-- Atualizar trigger para fazer primeiro usuário admin automaticamente
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
  is_first_user BOOLEAN := false;
  user_count INTEGER;
BEGIN
  meta_data := NEW.raw_user_meta_data;
  
  -- Verificar se é o primeiro usuário (que será admin automaticamente)
  SELECT COUNT(*) INTO user_count FROM public.uso_usuarios;
  is_first_user := (user_count = 0);
  
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
    is_first_user  -- Primeiro usuário é admin automaticamente
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    plano = EXCLUDED.plano,
    is_admin = CASE 
      WHEN is_first_user THEN true 
      ELSE uso_usuarios.is_admin 
    END,
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