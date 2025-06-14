
-- Adicionar campo arquivo_original_nome na tabela uploads
ALTER TABLE public.uploads 
ADD COLUMN arquivo_original_nome TEXT;

-- Atualizar registros existentes com um nome padrão baseado no ID
UPDATE public.uploads 
SET arquivo_original_nome = CONCAT('arquivo_', SUBSTRING(id::text, 1, 8))
WHERE arquivo_original_nome IS NULL;

-- Tornar o campo obrigatório após atualizar os dados existentes
ALTER TABLE public.uploads 
ALTER COLUMN arquivo_original_nome SET NOT NULL;
