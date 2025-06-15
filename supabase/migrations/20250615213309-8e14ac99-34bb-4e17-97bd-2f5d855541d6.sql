
-- Atualizar a função para garantir que sempre tenha um plan_id válido
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_plan_id UUID;
BEGIN
  -- Buscar o ID do plano Free como padrão
  SELECT id INTO default_plan_id
  FROM public.plans 
  WHERE name = 'Free' AND is_active = true
  LIMIT 1;
  
  -- Se não encontrar o plano Free, pegar o primeiro plano ativo disponível
  IF default_plan_id IS NULL THEN
    SELECT id INTO default_plan_id
    FROM public.plans 
    WHERE is_active = true
    ORDER BY price_brl ASC
    LIMIT 1;
  END IF;
  
  -- Se ainda não tiver um plano, criar um erro
  IF default_plan_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum plano ativo encontrado no sistema';
  END IF;
  
  -- Inserir o registro de uso com o plano padrão
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
    default_plan_id, 
    'free', -- Manter para compatibilidade
    0, 
    0, 
    0,
    false
  );
  
  RETURN NEW;
END;
$$;
