
-- Inserir seu email como administrador na tabela admin_users
-- Substitua 'seu-email@exemplo.com' pelo seu email real
INSERT INTO public.admin_users (user_id, email) 
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (email) DO NOTHING;

-- Criar função para facilitar adição de novos admins
CREATE OR REPLACE FUNCTION public.add_admin_by_email(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Verificar se quem está chamando é admin (exceto se for o primeiro admin)
  IF EXISTS (SELECT 1 FROM public.admin_users) AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem adicionar novos admins';
  END IF;
  
  -- Encontrar usuário por email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = admin_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado com email: %', admin_email;
  END IF;
  
  -- Inserir como admin
  INSERT INTO public.admin_users (user_id, email) 
  VALUES (target_user_id, admin_email)
  ON CONFLICT (email) DO NOTHING;
  
  RETURN TRUE;
END;
$$;
