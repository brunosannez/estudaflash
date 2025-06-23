
-- FASE 1: LIMPEZA COMPLETA DO BANCO DE DADOS
-- Remove todas as sessões de quiz problemáticas
DELETE FROM quiz_attempts;
DELETE FROM quiz_sessions;

-- Remove quizzes com dados inconsistentes
DELETE FROM quizzes WHERE 
  pergunta IS NULL OR 
  pergunta = '' OR 
  alternativas IS NULL OR 
  jsonb_array_length(alternativas) != 5 OR
  correta IS NULL OR
  correta < 0 OR
  correta > 4;

-- Padroniza o campo correta para garantir consistência
UPDATE quizzes 
SET correta = CASE 
  WHEN correta::text ~ '^[0-4]$' THEN correta::integer
  ELSE 0
END;

-- Remove dados de gamificação relacionados a quizzes problemáticos
DELETE FROM daily_activities WHERE quizzes_completed > 0;

-- Reseta contadores de quiz dos usuários para começar limpo
UPDATE uso_usuarios SET quizzes_realizados = 0;

-- Cria índices otimizados para performance
DROP INDEX IF EXISTS idx_quiz_sessions_user_status;
DROP INDEX IF EXISTS idx_quiz_attempts_session;
DROP INDEX IF EXISTS idx_quizzes_resumo;

CREATE INDEX idx_quiz_sessions_user_status ON quiz_sessions(user_id, status, last_activity_at DESC);
CREATE INDEX idx_quiz_attempts_session ON quiz_attempts(session_id, answered_at);
CREATE INDEX idx_quizzes_resumo_consistent ON quizzes(resumo_id) WHERE pergunta IS NOT NULL AND alternativas IS NOT NULL;

-- Recria função de atualização de progresso com lógica bulletproof
CREATE OR REPLACE FUNCTION update_quiz_session_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_questions integer;
  answered_count integer;
  correct_count integer;
  progress_percent numeric;
BEGIN
  -- Busca total de questões da sessão
  SELECT qs.total_questions INTO total_questions
  FROM quiz_sessions qs
  WHERE qs.id = NEW.session_id;
  
  -- Conta respostas e acertos
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct = true)
  INTO answered_count, correct_count
  FROM quiz_attempts qa
  WHERE qa.session_id = NEW.session_id;
  
  -- Calcula progresso
  progress_percent := CASE 
    WHEN total_questions > 0 THEN (answered_count::numeric / total_questions) * 100
    ELSE 0
  END;
  
  -- Atualiza sessão com dados consistentes
  UPDATE quiz_sessions
  SET 
    progress_percentage = progress_percent,
    current_question_index = answered_count,
    correct_answers = correct_count,
    last_activity_at = now(),
    status = CASE 
      WHEN progress_percent >= 100 THEN 'completed'
      ELSE 'in_progress'
    END
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recria trigger
DROP TRIGGER IF EXISTS quiz_progress_trigger ON quiz_attempts;
CREATE TRIGGER quiz_progress_trigger
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_session_progress();
