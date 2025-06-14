
-- Criar tabela resumos para armazenar resumos gerados pela IA
CREATE TABLE public.resumos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID REFERENCES public.uploads(id) NOT NULL,
  resumo_gerado TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.resumos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas seus próprios resumos
CREATE POLICY "Users can view their own resumos" 
  ON public.resumos 
  FOR SELECT 
  USING (
    upload_id IN (
      SELECT id FROM public.uploads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create resumos for their uploads" 
  ON public.resumos 
  FOR INSERT 
  WITH CHECK (
    upload_id IN (
      SELECT id FROM public.uploads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own resumos" 
  ON public.resumos 
  FOR UPDATE 
  USING (
    upload_id IN (
      SELECT id FROM public.uploads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own resumos" 
  ON public.resumos 
  FOR DELETE 
  USING (
    upload_id IN (
      SELECT id FROM public.uploads WHERE user_id = auth.uid()
    )
  );
