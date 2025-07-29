-- Correção dos Alertas de Segurança - Apenas Funções

-- 1. Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.get_enhanced_quiz_history(target_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(session_id uuid, resumo_id uuid, resumo_titulo text, quiz_title text, status text, total_questions integer, correct_answers integer, progress_percentage numeric, created_at timestamp with time zone, last_activity_at timestamp with time zone, completion_time_seconds integer, can_resume boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_quiz_session_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_questions integer;
  answered_count integer;
  correct_count integer;
  progress_percent numeric;
BEGIN
  -- Busca total de questões da sessão
  SELECT qs.total_questions INTO total_questions
  FROM public.quiz_sessions qs
  WHERE qs.id = NEW.session_id;
  
  -- Conta respostas e acertos
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_correct = true)
  INTO answered_count, correct_count
  FROM public.quiz_attempts qa
  WHERE qa.session_id = NEW.session_id;
  
  -- Calcula progresso
  progress_percent := CASE 
    WHEN total_questions > 0 THEN (answered_count::numeric / total_questions) * 100
    ELSE 0
  END;
  
  -- Atualiza sessão com dados consistentes
  UPDATE public.quiz_sessions
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
$function$;

-- Corrigir todas as outras funções com search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = user_uuid
  );
END;
$function$;