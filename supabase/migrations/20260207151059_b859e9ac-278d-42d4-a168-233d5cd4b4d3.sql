
-- 1. Corrigir usuarios existentes com 0 creditos (que nunca usaram creditos)
UPDATE public.uso_usuarios uu
SET credits_remaining = p.credits_per_month
FROM public.plans p
WHERE uu.plan_id = p.id
  AND uu.credits_remaining = 0
  AND uu.credits_used_this_month = 0;

-- 2. Criar funcao para inicializar creditos automaticamente em novos usuarios
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.plan_id IS NOT NULL AND (NEW.credits_remaining IS NULL OR NEW.credits_remaining = 0) THEN
    SELECT credits_per_month INTO NEW.credits_remaining
    FROM public.plans WHERE id = NEW.plan_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Criar trigger BEFORE INSERT na tabela uso_usuarios
CREATE TRIGGER tr_initialize_credits
BEFORE INSERT ON public.uso_usuarios
FOR EACH ROW
EXECUTE FUNCTION public.initialize_user_credits();
