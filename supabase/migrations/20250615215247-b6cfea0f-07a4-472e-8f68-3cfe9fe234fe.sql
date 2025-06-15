
-- Drop old functions and triggers if they exist to avoid conflicts
DROP FUNCTION IF EXISTS public.handle_new_user_usage() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_profile_and_guardian() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_setup() CASCADE;

-- Create a single function to handle all setup for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user_setup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_data JSONB;
  guardian_data JSONB;
  selected_plan_id UUID;
  default_plan_id UUID;
  plan_name_text TEXT;
BEGIN
  meta_data := NEW.raw_user_meta_data;
  
  -- 1. Insert into user_profiles
  IF meta_data ? 'full_name' AND meta_data ? 'date_of_birth' THEN
    INSERT INTO public.user_profiles (user_id, full_name, date_of_birth, school_year, is_minor)
    VALUES (
      NEW.id,
      meta_data->>'full_name',
      (meta_data->>'date_of_birth')::date,
      meta_data->>'school_year',
      (meta_data->>'is_minor')::boolean
    );
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
      );
    END IF;
  END IF;

  -- 3. Insert into uso_usuarios (usage data)
  -- Check if plan_id is provided in user metadata
  IF meta_data ? 'plan_id' AND meta_data->>'plan_id' IS NOT NULL AND meta_data->>'plan_id' != '' THEN
     selected_plan_id := (meta_data->>'plan_id')::UUID;
  END IF;
  
  -- If no plan_id in metadata, find a default plan
  IF selected_plan_id IS NULL THEN
    -- Try to find 'Free' plan
    SELECT id INTO default_plan_id
    FROM public.plans 
    WHERE name = 'Free' AND is_active = true
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
  
  -- If still no plan, raise an error
  IF selected_plan_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum plano ativo encontrado no sistema para atribuir ao novo usuário.';
  END IF;

  -- Get plan name for 'plano' column for backwards compatibility
  SELECT name INTO plan_name_text FROM public.plans WHERE id = selected_plan_id;
  
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
    LOWER(COALESCE(plan_name_text, 'free')),
    0, 
    0, 
    0,
    false
  );

  RETURN NEW;
END;
$$;

-- Create the trigger that executes the new setup function on new user creation
CREATE TRIGGER on_auth_user_created_setup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_setup();
