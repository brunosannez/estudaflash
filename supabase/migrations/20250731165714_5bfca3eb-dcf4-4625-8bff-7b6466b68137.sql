-- Melhorias no sistema de flashcards: spaced repetition e categorização

-- Adicionar campos de spaced repetition na tabela flashcards
ALTER TABLE public.flashcards 
ADD COLUMN difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
ADD COLUMN repetition_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN ef_factor NUMERIC(3,2) NOT NULL DEFAULT 2.5 CHECK (ef_factor >= 1.3),
ADD COLUMN next_review_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN last_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN category TEXT,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;

-- Melhorar tabela flashcard_reviews com mais dados
ALTER TABLE public.flashcard_reviews 
ADD COLUMN difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
ADD COLUMN response_time_ms INTEGER,
ADD COLUMN review_quality INTEGER CHECK (review_quality >= 0 AND review_quality <= 5),
ADD COLUMN notes TEXT;

-- Criar tabela para categorias personalizadas
CREATE TABLE public.flashcard_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Criar tabela para estatísticas de estudo por categoria
CREATE TABLE public.flashcard_study_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT,
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  cards_remembered INTEGER NOT NULL DEFAULT 0,
  total_study_time_minutes INTEGER NOT NULL DEFAULT 0,
  average_response_time_ms INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, study_date)
);

-- Criar tabela para metas de estudo
CREATE TABLE public.flashcard_study_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily_cards', 'weekly_cards', 'daily_time', 'weekly_time', 'category_mastery')),
  target_value INTEGER NOT NULL,
  current_progress INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.flashcard_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_study_goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para flashcard_categories
CREATE POLICY "Users can manage their own categories" 
ON public.flashcard_categories 
FOR ALL 
USING (user_id = auth.uid());

-- Políticas RLS para flashcard_study_stats
CREATE POLICY "Users can manage their own study stats" 
ON public.flashcard_study_stats 
FOR ALL 
USING (user_id = auth.uid());

-- Políticas RLS para flashcard_study_goals
CREATE POLICY "Users can manage their own study goals" 
ON public.flashcard_study_goals 
FOR ALL 
USING (user_id = auth.uid());

-- Criar função para calcular próxima data de revisão baseada no algoritmo SM-2
CREATE OR REPLACE FUNCTION public.calculate_next_review_date(
  current_ef_factor NUMERIC,
  repetition_count INTEGER,
  quality INTEGER
) RETURNS TABLE(
  next_date DATE,
  new_ef_factor NUMERIC,
  new_repetition_count INTEGER
) AS $$
DECLARE
  new_ef NUMERIC;
  new_rep INTEGER;
  interval_days INTEGER;
BEGIN
  -- Calcular novo EF factor baseado na qualidade da resposta
  new_ef := current_ef_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  -- EF factor não pode ser menor que 1.3
  IF new_ef < 1.3 THEN
    new_ef := 1.3;
  END IF;
  
  -- Calcular novo repetition count
  IF quality < 3 THEN
    new_rep := 0; -- Reiniciar se a qualidade for muito baixa
  ELSE
    new_rep := repetition_count + 1;
  END IF;
  
  -- Calcular intervalo em dias
  IF new_rep = 0 THEN
    interval_days := 1;
  ELSIF new_rep = 1 THEN
    interval_days := 6;
  ELSE
    interval_days := CEIL((new_rep - 1) * new_ef);
  END IF;
  
  RETURN QUERY SELECT 
    (CURRENT_DATE + interval_days)::DATE as next_date,
    new_ef as new_ef_factor,
    new_rep as new_repetition_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Criar função para obter flashcards que precisam ser revisados
CREATE OR REPLACE FUNCTION public.get_flashcards_due_for_review(target_user_id UUID)
RETURNS TABLE(
  flashcard_id UUID,
  pergunta TEXT,
  resposta TEXT,
  exemplo TEXT,
  category TEXT,
  difficulty INTEGER,
  next_review_date DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as flashcard_id,
    f.pergunta,
    f.resposta,
    f.exemplo,
    f.category,
    f.difficulty,
    f.next_review_date,
    (CURRENT_DATE - f.next_review_date)::INTEGER as days_overdue
  FROM public.flashcards f
  INNER JOIN public.resumos r ON f.resumo_id = r.id
  INNER JOIN public.uploads u ON r.upload_id = u.id
  WHERE u.user_id = target_user_id
    AND f.next_review_date <= CURRENT_DATE
  ORDER BY f.next_review_date ASC, f.difficulty DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índices para performance
CREATE INDEX idx_flashcards_next_review ON public.flashcards(next_review_date);
CREATE INDEX idx_flashcards_category ON public.flashcards(category);
CREATE INDEX idx_flashcards_tags ON public.flashcards USING GIN(tags);
CREATE INDEX idx_flashcard_categories_user ON public.flashcard_categories(user_id);
CREATE INDEX idx_flashcard_study_stats_user_date ON public.flashcard_study_stats(user_id, study_date);
CREATE INDEX idx_flashcard_study_goals_user_active ON public.flashcard_study_goals(user_id, is_active);