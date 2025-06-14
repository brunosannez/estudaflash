
-- Criar tabela para sessões de quiz
CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resumo_id UUID NOT NULL REFERENCES resumos(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  completion_time_seconds INTEGER,
  questions_data JSONB NOT NULL, -- Para armazenar detalhes das perguntas respondidas
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuário vê apenas suas sessões"
  ON public.quiz_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário pode inserir suas sessões"
  ON public.quiz_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário pode alterar suas sessões"
  ON public.quiz_sessions
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuário pode deletar suas sessões"
  ON public.quiz_sessions
  FOR DELETE
  USING (user_id = auth.uid());
