
-- FASE 1: LIMPEZA IMEDIATA DO BANCO DE DADOS
-- Remove sessões duplicadas mantendo apenas a mais recente por resumo_id
WITH ranked_sessions AS (
  SELECT id, resumo_id, user_id,
         ROW_NUMBER() OVER (PARTITION BY resumo_id, user_id ORDER BY created_at DESC) as rn
  FROM quiz_sessions
),
sessions_to_delete AS (
  SELECT id FROM ranked_sessions WHERE rn > 1
)
DELETE FROM quiz_attempts 
WHERE session_id IN (SELECT id FROM sessions_to_delete);

-- Remove as sessões duplicadas
WITH ranked_sessions AS (
  SELECT id, resumo_id, user_id,
         ROW_NUMBER() OVER (PARTITION BY resumo_id, user_id ORDER BY created_at DESC) as rn
  FROM quiz_sessions
)
DELETE FROM quiz_sessions 
WHERE id IN (
  SELECT id FROM ranked_sessions WHERE rn > 1
);

-- Corrige sessões com progresso inconsistente
UPDATE quiz_sessions 
SET 
  current_question_index = 0,
  progress_percentage = 0,
  status = 'in_progress'
WHERE (current_question_index IS NULL OR progress_percentage IS NULL OR status IS NULL);

-- Remove quizzes órfãos (sem resumo correspondente)
DELETE FROM quizzes 
WHERE resumo_id NOT IN (SELECT id FROM resumos);

-- Adiciona constraint para evitar sessões duplicadas no futuro
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_sessions_unique_resumo_user 
ON quiz_sessions(resumo_id, user_id) 
WHERE status IN ('in_progress', 'paused');
