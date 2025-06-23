
-- First, let's create a comprehensive quiz attempts system for tracking individual responses
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resumo_id uuid NOT NULL,
  quiz_question_id uuid NOT NULL,
  selected_answer integer,
  is_correct boolean,
  answered_at timestamp with time zone DEFAULT now(),
  session_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Modify quiz_sessions to support in-progress states
ALTER TABLE public.quiz_sessions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
ADD COLUMN IF NOT EXISTS current_question_index integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS progress_percentage numeric DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_id ON public.quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_status ON public.quiz_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_resumo_id ON public.quiz_sessions(resumo_id);

-- Enable RLS on quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts"
  ON public.quiz_attempts
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own quiz attempts"
  ON public.quiz_attempts
  FOR DELETE
  USING (user_id = auth.uid());

-- Enable realtime for quiz_attempts
ALTER TABLE public.quiz_attempts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_attempts;

-- Create function to auto-save quiz progress
CREATE OR REPLACE FUNCTION public.update_quiz_session_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_questions integer;
  answered_questions integer;
  progress_pct numeric;
BEGIN
  -- Get total questions for this session
  SELECT total_questions INTO total_questions
  FROM public.quiz_sessions
  WHERE id = NEW.session_id;
  
  -- Count answered questions
  SELECT COUNT(*) INTO answered_questions
  FROM public.quiz_attempts
  WHERE session_id = NEW.session_id;
  
  -- Calculate progress percentage
  progress_pct := CASE 
    WHEN total_questions > 0 THEN (answered_questions::numeric / total_questions) * 100
    ELSE 0
  END;
  
  -- Update session progress
  UPDATE public.quiz_sessions
  SET 
    progress_percentage = progress_pct,
    last_activity_at = now(),
    status = CASE 
      WHEN progress_pct >= 100 THEN 'completed'
      ELSE 'in_progress'
    END,
    correct_answers = (
      SELECT COUNT(*) 
      FROM public.quiz_attempts 
      WHERE session_id = NEW.session_id AND is_correct = true
    )
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-updating progress
DROP TRIGGER IF EXISTS trigger_update_quiz_progress ON public.quiz_attempts;
CREATE TRIGGER trigger_update_quiz_progress
  AFTER INSERT OR UPDATE ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_session_progress();

-- Create function to get user's quiz history with enhanced data
CREATE OR REPLACE FUNCTION public.get_enhanced_quiz_history(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  session_id uuid,
  resumo_id uuid,
  resumo_titulo text,
  quiz_title text,
  status text,
  total_questions integer,
  correct_answers integer,
  progress_percentage numeric,
  created_at timestamp with time zone,
  last_activity_at timestamp with time zone,
  completion_time_seconds integer,
  can_resume boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qs.id as session_id,
    qs.resumo_id,
    COALESCE(r.custom_name, u.arquivo_original_nome, 'Resumo sem título') as resumo_titulo,
    qs.quiz_title,
    qs.status,
    qs.total_questions,
    qs.correct_answers,
    qs.progress_percentage,
    qs.created_at,
    qs.last_activity_at,
    qs.completion_time_seconds,
    (qs.status = 'in_progress' AND qs.progress_percentage < 100) as can_resume
  FROM public.quiz_sessions qs
  LEFT JOIN public.resumos r ON qs.resumo_id = r.id
  LEFT JOIN public.uploads u ON r.upload_id = u.id
  WHERE qs.user_id = target_user_id
  ORDER BY qs.last_activity_at DESC;
END;
$$;
