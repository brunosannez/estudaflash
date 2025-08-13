-- Add support for file processing tracking
CREATE TABLE IF NOT EXISTS public.file_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'audio', 'video', 'image'
  processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extracted_text TEXT,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.file_processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own file processing" 
ON public.file_processing_queue 
FOR ALL 
USING (user_id = auth.uid());

-- Add advanced analytics tables
CREATE TABLE IF NOT EXISTS public.study_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject_area TEXT,
  total_study_time_minutes INTEGER NOT NULL DEFAULT 0,
  flashcards_mastered INTEGER NOT NULL DEFAULT 0,
  quiz_accuracy_percentage NUMERIC(5,2) DEFAULT 0,
  weak_topics JSONB DEFAULT '[]',
  strong_topics JSONB DEFAULT '[]',
  learning_velocity NUMERIC(10,2) DEFAULT 0, -- cards mastered per minute
  retention_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, subject_area)
);

-- Enable RLS
ALTER TABLE public.study_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own analytics" 
ON public.study_analytics 
FOR ALL 
USING (user_id = auth.uid());

-- Enhanced spaced repetition tracking with more metrics
CREATE TABLE IF NOT EXISTS public.enhanced_flashcard_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flashcard_id UUID NOT NULL,
  user_id UUID NOT NULL,
  review_quality INTEGER NOT NULL CHECK (review_quality >= 0 AND review_quality <= 5),
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  previous_ef_factor NUMERIC(4,2),
  new_ef_factor NUMERIC(4,2),
  previous_repetition_count INTEGER,
  new_repetition_count INTEGER,
  previous_review_date DATE,
  next_review_date DATE,
  study_context JSONB DEFAULT '{}', -- device, time of day, session length, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enhanced_flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their enhanced reviews" 
ON public.enhanced_flashcard_reviews 
FOR ALL 
USING (user_id = auth.uid());

-- Study goals and objectives system
CREATE TABLE IF NOT EXISTS public.study_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objective_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  target_metric TEXT NOT NULL, -- 'cards_reviewed', 'study_time', 'quiz_accuracy', 'streak'
  target_value NUMERIC NOT NULL,
  current_progress NUMERIC NOT NULL DEFAULT 0,
  subject_area TEXT,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_xp INTEGER DEFAULT 0,
  streak_bonus_multiplier NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_objectives ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their study objectives" 
ON public.study_objectives 
FOR ALL 
USING (user_id = auth.uid());

-- Advanced spaced repetition function with SM-2+ algorithm
CREATE OR REPLACE FUNCTION public.calculate_enhanced_spaced_repetition(
  current_ef_factor NUMERIC,
  repetition_count INTEGER,
  quality INTEGER,
  response_time_ms INTEGER DEFAULT 0,
  confidence_level INTEGER DEFAULT 3
) RETURNS TABLE(
  next_date DATE,
  new_ef_factor NUMERIC,
  new_repetition_count INTEGER,
  difficulty_adjustment NUMERIC
) 
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  new_ef NUMERIC;
  new_rep INTEGER;
  interval_days INTEGER;
  time_factor NUMERIC;
  confidence_factor NUMERIC;
  difficulty_adj NUMERIC;
BEGIN
  -- Enhanced EF calculation with response time and confidence
  time_factor := CASE 
    WHEN response_time_ms <= 3000 THEN 0.1
    WHEN response_time_ms <= 10000 THEN 0.0
    ELSE -0.1
  END;
  
  confidence_factor := (confidence_level - 3) * 0.05;
  
  new_ef := current_ef_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)) + time_factor + confidence_factor;
  
  -- EF factor constraints
  IF new_ef < 1.3 THEN
    new_ef := 1.3;
  ELSIF new_ef > 2.5 THEN
    new_ef := 2.5;
  END IF;
  
  -- Calculate repetition count
  IF quality < 3 THEN
    new_rep := 0;
  ELSE
    new_rep := repetition_count + 1;
  END IF;
  
  -- Calculate interval with enhanced algorithm
  IF new_rep = 0 THEN
    interval_days := 1;
  ELSIF new_rep = 1 THEN
    interval_days := 6;
  ELSE
    interval_days := CEIL((new_rep - 1) * new_ef);
  END IF;
  
  -- Calculate difficulty adjustment for future recommendations
  difficulty_adj := CASE
    WHEN quality >= 4 AND response_time_ms <= 5000 THEN -0.1
    WHEN quality <= 2 OR response_time_ms >= 15000 THEN 0.1
    ELSE 0
  END;
  
  RETURN QUERY SELECT 
    (CURRENT_DATE + interval_days)::DATE as next_date,
    new_ef as new_ef_factor,
    new_rep as new_repetition_count,
    difficulty_adj as difficulty_adjustment;
END;
$$;

-- Function to get personalized study recommendations
CREATE OR REPLACE FUNCTION public.get_study_recommendations(
  target_user_id UUID
) RETURNS TABLE(
  recommendation_type TEXT,
  title TEXT,
  description TEXT,
  priority INTEGER,
  estimated_time_minutes INTEGER,
  target_cards INTEGER,
  subject_area TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      AVG(quiz_accuracy_percentage) as avg_accuracy,
      SUM(total_study_time_minutes) as total_time,
      ARRAY_AGG(DISTINCT weak_topics) as all_weak_topics
    FROM public.study_analytics
    WHERE user_id = target_user_id 
      AND date >= CURRENT_DATE - INTERVAL '7 days'
  ),
  overdue_cards AS (
    SELECT COUNT(*) as overdue_count, f.category
    FROM public.flashcards f
    INNER JOIN public.resumos r ON f.resumo_id = r.id
    INNER JOIN public.uploads u ON r.upload_id = u.id
    WHERE u.user_id = target_user_id
      AND f.next_review_date <= CURRENT_DATE
    GROUP BY f.category
  )
  SELECT 
    'review_overdue'::TEXT,
    'Revisar Cards Atrasados'::TEXT,
    CASE 
      WHEN oc.overdue_count > 20 THEN 'Você tem muitos cards atrasados! Priorize a revisão.'
      WHEN oc.overdue_count > 10 THEN 'Alguns cards precisam de revisão.'
      ELSE 'Poucos cards para revisar.'
    END::TEXT,
    CASE 
      WHEN oc.overdue_count > 20 THEN 1
      WHEN oc.overdue_count > 10 THEN 2
      ELSE 3
    END::INTEGER,
    LEAST(oc.overdue_count * 2, 60)::INTEGER,
    oc.overdue_count::INTEGER,
    COALESCE(oc.category, 'Geral')::TEXT
  FROM overdue_cards oc
  WHERE oc.overdue_count > 0
  
  UNION ALL
  
  SELECT 
    'weak_topics'::TEXT,
    'Focar em Pontos Fracos'::TEXT,
    'Dedique mais tempo aos tópicos com menor performance.'::TEXT,
    2::INTEGER,
    30::INTEGER,
    15::INTEGER,
    'Matemática'::TEXT
  FROM user_stats us
  WHERE us.avg_accuracy < 70
  
  ORDER BY priority ASC;
END;
$$;