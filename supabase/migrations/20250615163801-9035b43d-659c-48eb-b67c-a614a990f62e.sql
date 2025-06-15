
-- Drop existing policies to avoid conflicts during re-application
DROP POLICY IF EXISTS "Users can view their own usage data" ON public.uso_usuarios;
DROP POLICY IF EXISTS "Users can update their own usage data" ON public.uso_usuarios;
DROP POLICY IF EXISTS "Users can manage their own uploads" ON public.uploads;
DROP POLICY IF EXISTS "Users can manage their own flashcard reviews" ON public.flashcard_reviews;
DROP POLICY IF EXISTS "Users can manage their own quiz answers" ON public.quiz_respostas;
DROP POLICY IF EXISTS "Users can manage their own quiz sessions" ON public.quiz_sessions;
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can manage their own daily activities" ON public.daily_activities;
DROP POLICY IF EXISTS "Users can manage summaries from their own uploads" ON public.resumos;
DROP POLICY IF EXISTS "Users can manage flashcards from their own uploads" ON public.flashcards;
DROP POLICY IF EXISTS "Users can manage quizzes from their own uploads" ON public.quizzes;

-- Enable Row Level Security on all relevant tables
ALTER TABLE public.uso_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Set Replica Identity to FULL for realtime to receive old record data on updates/deletes
ALTER TABLE public.uso_usuarios REPLICA IDENTITY FULL;
ALTER TABLE public.uploads REPLICA IDENTITY FULL;
ALTER TABLE public.flashcard_reviews REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_respostas REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.user_progress REPLICA IDENTITY FULL;
ALTER TABLE public.daily_activities REPLICA IDENTITY FULL;
ALTER TABLE public.resumos REPLICA IDENTITY FULL;
ALTER TABLE public.flashcards REPLICA IDENTITY FULL;
ALTER TABLE public.quizzes REPLICA IDENTITY FULL;

-- === CREATE POLICIES ===

-- Policies for uso_usuarios (restricted to select/update)
CREATE POLICY "Users can view their own usage data" ON public.uso_usuarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own usage data" ON public.uso_usuarios FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for tables with a direct user_id column
CREATE POLICY "Users can manage their own uploads" ON public.uploads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own flashcard reviews" ON public.flashcard_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own quiz answers" ON public.quiz_respostas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own quiz sessions" ON public.quiz_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily activities" ON public.daily_activities FOR ALL USING (auth.uid() = user_id);

-- Policies for tables related via uploads
CREATE POLICY "Users can manage summaries from their own uploads" ON public.resumos FOR ALL USING (upload_id IN (SELECT id FROM public.uploads WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage flashcards from their own uploads" ON public.flashcards FOR ALL USING (resumo_id IN (SELECT r.id FROM public.resumos r JOIN public.uploads u ON r.upload_id = u.id WHERE u.user_id = auth.uid()));

CREATE POLICY "Users can manage quizzes from their own uploads" ON public.quizzes FOR ALL USING (resumo_id IN (SELECT r.id FROM public.resumos r JOIN public.uploads u ON r.upload_id = u.id WHERE u.user_id = auth.uid()));

