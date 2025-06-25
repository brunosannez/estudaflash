
-- Criar tabela para sessões de flashcards
CREATE TABLE public.flashcard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resumo_id UUID NOT NULL REFERENCES resumos(id) ON DELETE CASCADE,
  current_card_index INTEGER NOT NULL DEFAULT 0,
  completed_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  session_stats JSONB NOT NULL DEFAULT '{
    "streak": 0,
    "totalReviewed": 0,
    "xpEarned": 0,
    "correct": 0,
    "incorrect": 0
  }'::jsonb,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Habilitar RLS
ALTER TABLE public.flashcard_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their own flashcard sessions"
  ON public.flashcard_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own flashcard sessions"
  ON public.flashcard_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own flashcard sessions"
  ON public.flashcard_sessions
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own flashcard sessions"
  ON public.flashcard_sessions
  FOR DELETE
  USING (user_id = auth.uid());

-- Índices para performance
CREATE INDEX idx_flashcard_sessions_user_resumo ON public.flashcard_sessions(user_id, resumo_id);
CREATE INDEX idx_flashcard_sessions_activity ON public.flashcard_sessions(last_activity_at);
