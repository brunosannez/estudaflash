-- FASE 1: Limpar sistema atual
DROP TABLE IF EXISTS quiz_respostas CASCADE;
DROP TABLE IF EXISTS quiz_sessions CASCADE;
DROP TABLE IF EXISTS quiz_performance_stats CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_configurations CASCADE;
DROP TABLE IF EXISTS quiz_badges CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS quiz_metadata CASCADE;

-- FASE 2: Criar nova estrutura ENEM
CREATE TABLE public.enem_quiz_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resumo_id UUID NOT NULL,
  tema TEXT NOT NULL,
  idade_usuario INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  macrothemes JSONB NOT NULL DEFAULT '[]'::jsonb,
  targets JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated JSONB NOT NULL DEFAULT '{}'::jsonb,
  coverage_map JSONB NOT NULL DEFAULT '[]'::jsonb,
  quality_checks JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.enem_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_metadata_id UUID NOT NULL REFERENCES public.enem_quiz_metadata(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('objetiva', 'vf_sequencial')),
  enunciado TEXT NOT NULL,
  stem TEXT, -- Para questões objetivas
  statements JSONB, -- Para questões V/F sequenciais
  options JSONB NOT NULL, -- Array de alternativas
  correct_index INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cognitive_level TEXT NOT NULL CHECK (cognitive_level IN ('remember', 'understand', 'apply', 'analyze')),
  evidence TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.enem_quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_metadata_id UUID NOT NULL REFERENCES public.enem_quiz_metadata(id) ON DELETE CASCADE,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  user_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.enem_user_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.enem_quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.enem_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enem_quiz_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_user_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view quiz metadata from their uploads" ON public.enem_quiz_metadata
  FOR SELECT USING (
    resumo_id IN (
      SELECT r.id FROM resumos r
      JOIN uploads u ON r.upload_id = u.id
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert quiz metadata" ON public.enem_quiz_metadata
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view questions from their quizzes" ON public.enem_questions
  FOR SELECT USING (
    quiz_metadata_id IN (
      SELECT qm.id FROM enem_quiz_metadata qm
      JOIN resumos r ON qm.resumo_id = r.id
      JOIN uploads u ON r.upload_id = u.id
      WHERE u.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert questions" ON public.enem_questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their quiz sessions" ON public.enem_quiz_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their answers" ON public.enem_user_answers
  FOR ALL USING (auth.uid() = user_id);