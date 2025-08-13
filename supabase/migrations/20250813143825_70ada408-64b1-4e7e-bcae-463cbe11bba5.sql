-- Add question type column to quizzes table for V/F questions
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'multipla_escolha';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_tipo ON public.quizzes(tipo);

-- Add constraint to ensure valid question types
ALTER TABLE public.quizzes ADD CONSTRAINT check_quiz_type 
CHECK (tipo IN ('multipla_escolha', 'verdadeiro_falso'));