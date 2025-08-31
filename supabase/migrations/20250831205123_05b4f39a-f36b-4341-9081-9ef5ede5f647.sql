-- Expandir schema para suportar sistema ENEM avançado

-- Adicionar novos campos à tabela quizzes
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS context TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'));
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS cognitive_level TEXT CHECK (cognitive_level IN ('remember', 'understand', 'apply', 'analyze'));
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS evidence TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS statements JSONB; -- Para V/F combinações
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS answer BOOLEAN; -- Para V/F simples
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'objetiva' CHECK (question_type IN ('objetiva', 'verdadeiro_falso_simples', 'verdadeiro_falso_combinacoes'));

-- Criar nova tabela para metadados do quiz
CREATE TABLE IF NOT EXISTS quiz_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resumo_id UUID NOT NULL REFERENCES resumos(id) ON DELETE CASCADE,
  tema TEXT NOT NULL,
  idade_usuario INTEGER,
  word_count INTEGER,
  macrothemes JSONB DEFAULT '[]'::jsonb,
  targets JSONB DEFAULT '{}'::jsonb,
  generated JSONB DEFAULT '{}'::jsonb,
  coverage_map JSONB DEFAULT '[]'::jsonb,
  quality_checks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS para quiz_metadata
ALTER TABLE quiz_metadata ENABLE ROW LEVEL SECURITY;

-- Policy para quiz_metadata - usuários podem ver metadados de seus próprios resumos
CREATE POLICY "Users can view quiz metadata from their own uploads"
ON quiz_metadata FOR SELECT
USING (
  resumo_id IN (
    SELECT r.id FROM resumos r 
    INNER JOIN uploads u ON r.upload_id = u.id 
    WHERE u.user_id = auth.uid()
  )
);

-- Policy para inserir metadados
CREATE POLICY "Users can insert quiz metadata for their own uploads"
ON quiz_metadata FOR INSERT
WITH CHECK (
  resumo_id IN (
    SELECT r.id FROM resumos r 
    INNER JOIN uploads u ON r.upload_id = u.id 
    WHERE u.user_id = auth.uid()
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_quiz_metadata_resumo_id ON quiz_metadata(resumo_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_question_type ON quizzes(question_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);