-- Clean up old problematic quiz questions
DELETE FROM quizzes WHERE 
  alternativas IS NULL 
  OR jsonb_array_length(alternativas) != 5 
  OR correta < 0 
  OR correta > 4
  OR pergunta IS NULL 
  OR pergunta = ''
  OR question_type IN ('verdadeiro_falso_simples', 'verdadeiro_falso_combinacoes');

-- Update quiz_sessions to handle both question types
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS question_types jsonb DEFAULT '{"multiple_choice": 0, "true_false": 0}'::jsonb;

-- Add support for True/False questions in quizzes table
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS true_false_statements jsonb DEFAULT NULL;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS correct_statements jsonb DEFAULT NULL;