
-- Atualizar o usuário atual como administrador
-- Substitua 'brunosannez@hotmail.com' pelo seu email se for diferente
UPDATE public.uso_usuarios 
SET is_admin = true, updated_at = now()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'brunosannez@hotmail.com'
);

-- Verificar se a atualização foi bem-sucedida
SELECT 
  uu.user_id,
  au.email,
  uu.is_admin,
  uu.updated_at
FROM public.uso_usuarios uu
INNER JOIN auth.users au ON uu.user_id = au.id
WHERE au.email = 'brunosannez@hotmail.com';
