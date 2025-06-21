
-- Criar tabela para mapas mentais
CREATE TABLE public.mind_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resumo_id UUID NOT NULL REFERENCES public.resumos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS para segurança
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;

-- Política para visualizar mapas mentais próprios
CREATE POLICY "Users can view their own mind maps" 
  ON public.mind_maps 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para criar mapas mentais próprios
CREATE POLICY "Users can create their own mind maps" 
  ON public.mind_maps 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar mapas mentais próprios
CREATE POLICY "Users can update their own mind maps" 
  ON public.mind_maps 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para deletar mapas mentais próprios
CREATE POLICY "Users can delete their own mind maps" 
  ON public.mind_maps 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_mind_maps_resumo_id ON public.mind_maps(resumo_id);
CREATE INDEX idx_mind_maps_user_id ON public.mind_maps(user_id);
