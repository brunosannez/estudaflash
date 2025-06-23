
-- Corrigir a função update_quiz_session_progress para resolver ambiguidade de colunas
CREATE OR REPLACE FUNCTION public.update_quiz_session_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_total_questions integer;
  answered_questions integer;
  progress_pct numeric;
BEGIN
  -- Get total questions for this session com alias explícito
  SELECT qs.total_questions INTO session_total_questions
  FROM public.quiz_sessions qs
  WHERE qs.id = NEW.session_id;
  
  -- Count answered questions
  SELECT COUNT(*) INTO answered_questions
  FROM public.quiz_attempts qa
  WHERE qa.session_id = NEW.session_id;
  
  -- Calculate progress percentage
  progress_pct := CASE 
    WHEN session_total_questions > 0 THEN (answered_questions::numeric / session_total_questions) * 100
    ELSE 0
  END;
  
  -- Update session progress com aliases explícitos
  UPDATE public.quiz_sessions qs
  SET 
    progress_percentage = progress_pct,
    last_activity_at = now(),
    status = CASE 
      WHEN progress_pct >= 100 THEN 'completed'
      ELSE 'in_progress'
    END,
    correct_answers = (
      SELECT COUNT(*) 
      FROM public.quiz_attempts qa2
      WHERE qa2.session_id = NEW.session_id AND qa2.is_correct = true
    )
  WHERE qs.id = NEW.session_id;
  
  RETURN NEW;
END;
$$;
