
CREATE OR REPLACE FUNCTION public.user_select_plan(new_plan_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.plans
    WHERE id = new_plan_id AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Plano nao encontrado ou inativo';
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
