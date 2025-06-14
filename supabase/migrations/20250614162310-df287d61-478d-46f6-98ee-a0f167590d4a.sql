
-- 1. Criar tabela flashcards
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resumo_id UUID NOT NULL REFERENCES resumos(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  exemplo TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Criar tabela de reviews dos flashcards (para repetição espaçada)
CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  lembrou BOOLEAN NOT NULL,
  data_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS para flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- 4. Habilitar RLS para flashcard_reviews
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acesso para flashcards
CREATE POLICY "Usuário pode visualizar seus flashcards"
  ON public.flashcards
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = flashcards.resumo_id
      AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode inserir seus flashcards"
  ON public.flashcards
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = flashcards.resumo_id
      AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode atualizar seus flashcards"
  ON public.flashcards
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = flashcards.resumo_id
      AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode deletar seus flashcards"
  ON public.flashcards
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = flashcards.resumo_id
      AND u.user_id = auth.uid()
    )
  );

-- 6. Políticas de acesso para flashcard_reviews
CREATE POLICY "Usuário pode visualizar seus reviews"
  ON public.flashcard_reviews
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário pode inserir seu review"
  ON public.flashcard_reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário pode atualizar seu review"
  ON public.flashcard_reviews
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuário pode deletar seu review"
  ON public.flashcard_reviews
  FOR DELETE
  USING (user_id = auth.uid());
