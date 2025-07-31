-- Fase 3: Sistema de Quiz Melhorado
-- Melhorias nas tabelas existentes e novas funcionalidades

-- 1. Adicionar campos para análise de performance na tabela quiz_sessions
ALTER TABLE public.quiz_sessions 
ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS time_per_question_seconds integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS hints_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS performance_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS weak_topics jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS study_recommendations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS session_type text DEFAULT 'practice',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Adicionar campos para análise detalhada na tabela quiz_attempts
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS confidence_level integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS time_taken_seconds integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS hint_used boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS difficulty_perceived integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS explanation_viewed boolean DEFAULT false;

-- 3. Criar tabela para configurações de quiz personalizadas
CREATE TABLE IF NOT EXISTS public.quiz_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  time_limit_minutes integer DEFAULT 15,
  questions_count integer DEFAULT 10,
  difficulty_level integer DEFAULT 1,
  randomize_questions boolean DEFAULT true,
  randomize_answers boolean DEFAULT true,
  show_explanations boolean DEFAULT true,
  allow_hints boolean DEFAULT false,
  category_filters text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS para quiz_configurations
ALTER TABLE public.quiz_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quiz configurations" 
ON public.quiz_configurations 
FOR ALL 
USING (user_id = auth.uid());

-- 4. Criar tabela para estatísticas de quiz detalhadas
CREATE TABLE IF NOT EXISTS public.quiz_performance_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_quizzes_attempted integer DEFAULT 0,
  total_quizzes_completed integer DEFAULT 0,
  total_questions_answered integer DEFAULT 0,
  total_correct_answers integer DEFAULT 0,
  average_accuracy numeric DEFAULT 0,
  average_time_per_question numeric DEFAULT 0,
  fastest_completion_time integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  topics_mastered text[] DEFAULT '{}',
  topics_struggling text[] DEFAULT '{}',
  xp_earned_from_quizzes integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS para quiz_performance_stats
ALTER TABLE public.quiz_performance_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quiz performance stats" 
ON public.quiz_performance_stats 
FOR ALL 
USING (user_id = auth.uid());

-- 5. Criar tabela para badges de quiz
CREATE TABLE IF NOT EXISTS public.quiz_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  badge_icon text DEFAULT '🏆',
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- RLS para quiz_badges
ALTER TABLE public.quiz_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz badges" 
ON public.quiz_badges 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert quiz badges" 
ON public.quiz_badges 
FOR INSERT 
WITH CHECK (true);

-- 6. Função para calcular performance score
CREATE OR REPLACE FUNCTION public.calculate_quiz_performance_score(
  correct_answers integer,
  total_questions integer,
  completion_time_seconds integer,
  hints_used integer,
  difficulty_level integer DEFAULT 1
) RETURNS numeric AS $$
DECLARE
  base_score numeric;
  time_bonus numeric;
  hint_penalty numeric;
  difficulty_multiplier numeric;
  final_score numeric;
BEGIN
  -- Score base baseado na precisão (0-100)
  base_score := (correct_answers::numeric / total_questions::numeric) * 100;
  
  -- Bônus de tempo (máximo 20 pontos)
  -- Assumindo 30 segundos por pergunta como tempo ideal
  time_bonus := GREATEST(0, 20 - (completion_time_seconds::numeric / (total_questions * 30)) * 20);
  
  -- Penalidade por dicas (5 pontos por dica)
  hint_penalty := hints_used * 5;
  
  -- Multiplicador de dificuldade
  difficulty_multiplier := CASE 
    WHEN difficulty_level = 1 THEN 1.0
    WHEN difficulty_level = 2 THEN 1.2
    WHEN difficulty_level = 3 THEN 1.5
    ELSE 1.0
  END;
  
  -- Score final
  final_score := (base_score + time_bonus - hint_penalty) * difficulty_multiplier;
  
  -- Garantir que o score está entre 0 e 200
  RETURN GREATEST(0, LEAST(200, final_score));
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Função para analisar pontos fracos
CREATE OR REPLACE FUNCTION public.analyze_quiz_weak_topics(
  user_uuid uuid,
  last_sessions_count integer DEFAULT 5
) RETURNS TABLE(
  topic text,
  total_questions integer,
  correct_answers integer,
  accuracy_percentage numeric,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_sessions AS (
    SELECT qs.id, qs.questions_data
    FROM public.quiz_sessions qs
    WHERE qs.user_id = user_uuid
      AND qs.status = 'completed'
    ORDER BY qs.created_at DESC
    LIMIT last_sessions_count
  ),
  question_analysis AS (
    SELECT 
      jsonb_array_elements(rs.questions_data) as question_data,
      rs.id as session_id
    FROM recent_sessions rs
  ),
  topic_performance AS (
    SELECT 
      COALESCE(qa.question_data->>'category', 'Geral') as topic_name,
      COUNT(*) as total_qs,
      COUNT(*) FILTER (WHERE qa.question_data->>'user_answered_correctly' = 'true') as correct_qs
    FROM question_analysis qa
    GROUP BY COALESCE(qa.question_data->>'category', 'Geral')
  )
  SELECT 
    tp.topic_name,
    tp.total_qs,
    tp.correct_qs,
    ROUND((tp.correct_qs::numeric / tp.total_qs::numeric) * 100, 2) as accuracy_perc,
    CASE 
      WHEN (tp.correct_qs::numeric / tp.total_qs::numeric) < 0.6 THEN 'Revisar conceitos fundamentais'
      WHEN (tp.correct_qs::numeric / tp.total_qs::numeric) < 0.8 THEN 'Praticar mais exercícios'
      ELSE 'Manter o ritmo de estudos'
    END as recommendation_text
  FROM topic_performance tp
  WHERE tp.total_qs >= 2  -- Apenas tópicos com pelo menos 2 questões
  ORDER BY accuracy_perc ASC, tp.total_qs DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para atualizar estatísticas diárias de quiz
CREATE OR REPLACE FUNCTION public.update_daily_quiz_stats(target_user_id uuid)
RETURNS boolean AS $$
DECLARE
  today_stats record;
BEGIN
  -- Calcular estatísticas do dia
  SELECT 
    COUNT(*) FILTER (WHERE qs.status = 'in_progress') as attempted,
    COUNT(*) FILTER (WHERE qs.status = 'completed') as completed,
    SUM(qs.total_questions) FILTER (WHERE qs.status = 'completed') as total_questions,
    SUM(qs.correct_answers) FILTER (WHERE qs.status = 'completed') as total_correct,
    AVG(qs.completion_time_seconds) FILTER (WHERE qs.status = 'completed') as avg_time,
    MIN(qs.completion_time_seconds) FILTER (WHERE qs.status = 'completed') as fastest_time
  INTO today_stats
  FROM public.quiz_sessions qs
  WHERE qs.user_id = target_user_id
    AND qs.created_at::date = CURRENT_DATE;
  
  -- Inserir ou atualizar estatísticas
  INSERT INTO public.quiz_performance_stats (
    user_id,
    date,
    total_quizzes_attempted,
    total_quizzes_completed,
    total_questions_answered,
    total_correct_answers,
    average_accuracy,
    average_time_per_question,
    fastest_completion_time
  ) VALUES (
    target_user_id,
    CURRENT_DATE,
    COALESCE(today_stats.attempted, 0),
    COALESCE(today_stats.completed, 0),
    COALESCE(today_stats.total_questions, 0),
    COALESCE(today_stats.total_correct, 0),
    CASE 
      WHEN COALESCE(today_stats.total_questions, 0) > 0 
      THEN (COALESCE(today_stats.total_correct, 0)::numeric / today_stats.total_questions::numeric) * 100
      ELSE 0 
    END,
    COALESCE(today_stats.avg_time, 0),
    COALESCE(today_stats.fastest_time, 0)
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_quizzes_attempted = EXCLUDED.total_quizzes_attempted,
    total_quizzes_completed = EXCLUDED.total_quizzes_completed,
    total_questions_answered = EXCLUDED.total_questions_answered,
    total_correct_answers = EXCLUDED.total_correct_answers,
    average_accuracy = EXCLUDED.average_accuracy,
    average_time_per_question = EXCLUDED.average_time_per_question,
    fastest_completion_time = EXCLUDED.fastest_completion_time,
    updated_at = now();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para atualizar estatísticas automaticamente
CREATE OR REPLACE FUNCTION public.trigger_update_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas quando uma sessão é concluída
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM public.update_daily_quiz_stats(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS update_quiz_stats_trigger ON public.quiz_sessions;
CREATE TRIGGER update_quiz_stats_trigger
  AFTER UPDATE ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_quiz_stats();

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_status ON public.quiz_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created_date ON public.quiz_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_time ON public.quiz_attempts(session_id, answered_at);
CREATE INDEX IF NOT EXISTS idx_quiz_performance_stats_user_date ON public.quiz_performance_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_quiz_badges_user_type ON public.quiz_badges(user_id, badge_type);

-- 11. Função para verificar e conceder badges
CREATE OR REPLACE FUNCTION public.check_and_award_quiz_badges(target_user_id uuid)
RETURNS integer AS $$
DECLARE
  badges_awarded integer := 0;
  user_stats record;
BEGIN
  -- Buscar estatísticas do usuário
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
    AVG(CASE WHEN status = 'completed' THEN (correct_answers::numeric / total_questions::numeric) * 100 ELSE NULL END) as avg_accuracy,
    MAX(CASE WHEN status = 'completed' THEN (correct_answers::numeric / total_questions::numeric) * 100 ELSE NULL END) as best_accuracy,
    COUNT(*) FILTER (WHERE status = 'completed' AND (correct_answers::numeric / total_questions::numeric) = 1.0) as perfect_scores
  INTO user_stats
  FROM public.quiz_sessions
  WHERE user_id = target_user_id;
  
  -- Badge: Primeiro Quiz
  IF user_stats.total_completed >= 1 AND NOT EXISTS (
    SELECT 1 FROM public.quiz_badges 
    WHERE user_id = target_user_id AND badge_type = 'first_quiz'
  ) THEN
    INSERT INTO public.quiz_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (target_user_id, 'first_quiz', 'Primeira Tentativa', 'Completou seu primeiro quiz!', '🎯');
    badges_awarded := badges_awarded + 1;
  END IF;
  
  -- Badge: 10 Quizzes
  IF user_stats.total_completed >= 10 AND NOT EXISTS (
    SELECT 1 FROM public.quiz_badges 
    WHERE user_id = target_user_id AND badge_type = 'quiz_veteran'
  ) THEN
    INSERT INTO public.quiz_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (target_user_id, 'quiz_veteran', 'Veterano dos Quizzes', 'Completou 10 quizzes!', '🏅');
    badges_awarded := badges_awarded + 1;
  END IF;
  
  -- Badge: Perfeccionista
  IF user_stats.perfect_scores >= 3 AND NOT EXISTS (
    SELECT 1 FROM public.quiz_badges 
    WHERE user_id = target_user_id AND badge_type = 'perfectionist'
  ) THEN
    INSERT INTO public.quiz_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (target_user_id, 'perfectionist', 'Perfeccionista', 'Acertou 100% em 3 quizzes!', '💯');
    badges_awarded := badges_awarded + 1;
  END IF;
  
  -- Badge: Precisão Alta
  IF user_stats.avg_accuracy >= 90 AND user_stats.total_completed >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.quiz_badges 
    WHERE user_id = target_user_id AND badge_type = 'high_accuracy'
  ) THEN
    INSERT INTO public.quiz_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (target_user_id, 'high_accuracy', 'Mira Certeira', 'Mantém 90%+ de precisão!', '🎯');
    badges_awarded := badges_awarded + 1;
  END IF;
  
  RETURN badges_awarded;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;