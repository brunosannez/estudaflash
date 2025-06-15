
-- Fase 1: Configurar RLS para admin_users
-- Adicionar políticas RLS para a tabela admin_users

-- Política para admins verem todos os registros de admin
CREATE POLICY "Admins can view all admin_users" 
  ON public.admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Política para admins gerenciarem outros admins
CREATE POLICY "Admins can manage admin_users" 
  ON public.admin_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Fase 4: Criar função RPC para verificação de admin mais confiável
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_uuid UUID DEFAULT auth.uid())
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
