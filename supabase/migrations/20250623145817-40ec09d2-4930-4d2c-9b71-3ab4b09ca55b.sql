
-- Clean up inconsistent quiz data and standardize structure
DELETE FROM quiz_sessions WHERE questions_data IS NULL OR questions_data = '{}';
DELETE FROM quiz_attempts WHERE quiz_question_id IS NULL;
DELETE FROM quizzes WHERE pergunta IS NULL OR pergunta = '';

-- Ensure all existing quizzes have proper structure
UPDATE quizzes 
SET alternativas = CASE 
    WHEN jsonb_typeof(alternativas) != 'array' THEN '[]'::jsonb
    ELSE alternativas
END
WHERE alternativas IS NOT NULL;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_status ON quiz_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session ON quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_resumo ON quizzes(resumo_id);

-- Add trigger to automatically update quiz session progress
CREATE OR REPLACE FUNCTION update_quiz_session_progress()
RETURNS TRIGGER AS $$
DECLARE
  session_total_questions integer;
  answered_questions integer;
  correct_count integer;
  progress_pct numeric;
BEGIN
  -- Get total questions for this session
  SELECT qs.total_questions INTO session_total_questions
  FROM quiz_sessions qs
  WHERE qs.id = NEW.session_id;
  
  -- Count answered questions and correct answers
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct = true)
  INTO answered_questions, correct_count
  FROM quiz_attempts qa
  WHERE qa.session_id = NEW.session_id;
  
  -- Calculate progress percentage
  progress_pct := CASE 
    WHEN session_total_questions > 0 THEN (answered_questions::numeric / session_total_questions) * 100
    ELSE 0
  END;
  
  -- Update session progress
  UPDATE quiz_sessions qs
  SET 
    progress_percentage = progress_pct,
    current_question_index = answered_questions,
    correct_answers = correct_count,
    last_activity_at = now(),
    status = CASE 
      WHEN progress_pct >= 100 THEN 'completed'
      ELSE 'in_progress'
    END
  WHERE qs.id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS quiz_progress_trigger ON quiz_attempts;
CREATE TRIGGER quiz_progress_trigger
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_session_progress();

-- Clean up orphaned data
DELETE FROM quiz_attempts qa 
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_sessions qs WHERE qs.id = qa.session_id
);

-- Ensure quiz sessions have proper questions_data structure
UPDATE quiz_sessions 
SET questions_data = '[]'::jsonb 
WHERE questions_data IS NULL OR questions_data = '{}';
