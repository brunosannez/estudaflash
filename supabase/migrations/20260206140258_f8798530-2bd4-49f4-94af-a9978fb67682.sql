
-- Permitir admins gerenciar challenges
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON challenges;

-- Qualquer pessoa autenticada pode ver challenges ativos
CREATE POLICY "Anyone can view active challenges" ON challenges
FOR SELECT USING (is_active = true);

-- Admins podem gerenciar challenges (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage challenges" ON challenges
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM uso_usuarios
    WHERE user_id = auth.uid() AND is_admin = true
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM uso_usuarios
    WHERE user_id = auth.uid() AND is_admin = true
  )
);
