
-- Atualizar a tabela uso_usuarios para incluir os novos planos
ALTER TABLE public.uso_usuarios 
DROP CONSTRAINT IF EXISTS uso_usuarios_plano_check;

-- Adicionar constraint para os novos valores de plano
ALTER TABLE public.uso_usuarios 
ADD CONSTRAINT uso_usuarios_plano_check 
CHECK (plano IN ('free', 'pro', 'edu'));

-- Atualizar função para inicializar registro de uso quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.uso_usuarios (user_id, plano)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;

-- Criar tabela para definir quem é admin (baseado em email)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Adicionar RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Política para admins verem a tabela de admins
CREATE POLICY "Admins can view admin_users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
END;
$$;

-- Função para admin alterar plano de usuário
CREATE OR REPLACE FUNCTION public.admin_change_user_plan(
  target_user_id UUID,
  new_plan TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se quem está chamando é admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar planos de usuários';
  END IF;
  
  -- Verificar se o plano é válido
  IF new_plan NOT IN ('free', 'pro', 'edu') THEN
    RAISE EXCEPTION 'Plano inválido. Use: free, pro ou edu';
  END IF;
  
  -- Atualizar o plano do usuário
  UPDATE public.uso_usuarios 
  SET plano = new_plan, updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
END;
$$;

-- Inserir um admin inicial (substitua pelo seu email)
-- INSERT INTO public.admin_users (user_id, email) 
-- SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com'
-- ON CONFLICT (email) DO NOTHING;
