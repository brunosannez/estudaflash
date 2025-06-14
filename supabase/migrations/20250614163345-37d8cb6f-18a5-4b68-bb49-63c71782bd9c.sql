
-- 1. Tabela de quizzes (perguntas do quiz gerado)
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resumo_id UUID NOT NULL REFERENCES resumos(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  alternativas JSONB NOT NULL, -- array de 4 alternativas
  correta INTEGER NOT NULL,    -- índice da alternativa correta (0..3)
  explicacao TEXT NOT NULL,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela para respostas dos quizzes
CREATE TABLE public.quiz_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  acertou BOOLEAN NOT NULL,
  resposta_selecionada INTEGER NOT NULL,
  data_resposta TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS nas tabelas
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_respostas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para quizzes
CREATE POLICY "Usuário pode visualizar quizzes relacionados ao seu resumo"
  ON public.quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = quizzes.resumo_id
      AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode inserir quizzes nos seus resumos"
  ON public.quizzes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = quizzes.resumo_id
      AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode alterar quizzes dos seus resumos"
  ON public.quizzes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = quizzes.resumo_id
      AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuário pode deletar quizzes dos seus resumos"
  ON public.quizzes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM resumos r
      JOIN uploads u ON u.id = r.upload_id
      WHERE r.id = quizzes.resumo_id
      AND u.user_id = auth.uid()
    )
  );

-- 5. Políticas para quiz_respostas
CREATE POLICY "Usuário vê apenas suas respostas"
  ON public.quiz_respostas
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário pode inserir suas respostas"
  ON public.quiz_respostas
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário pode alterar suas respostas"
  ON public.quiz_respostas
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuário pode deletar suas respostas"
  ON public.quiz_respostas
  FOR DELETE
  USING (user_id = auth.uid());
