
-- Primeiro, vamos limpar os registros duplicados de forma mais eficiente
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM public.user_progress
)
DELETE FROM public.user_progress 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Agora aplicar a constraint de unicidade
ALTER TABLE public.user_progress 
ADD CONSTRAINT unique_user_progress UNIQUE (user_id);

-- Aplicar as políticas RLS que estavam faltando
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;

CREATE POLICY "Users can view their own progress" 
  ON public.user_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
  ON public.user_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.user_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para daily_activities
DROP POLICY IF EXISTS "Users can view their own activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON public.daily_activities;

CREATE POLICY "Users can view their own activities" 
  ON public.daily_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
  ON public.daily_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
  ON public.daily_activities 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar políticas RLS para flashcard_reviews
DROP POLICY IF EXISTS "Users can view their own flashcard reviews" ON public.flashcard_reviews;
DROP POLICY IF EXISTS "Users can insert their own flashcard reviews" ON public.flashcard_reviews;

CREATE POLICY "Users can view their own flashcard reviews" 
  ON public.flashcard_reviews 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcard reviews" 
  ON public.flashcard_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activities_user_id_date ON public.daily_activities(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_id ON public.flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_date ON public.flashcard_reviews(data_review);
