
-- Criar tabela uploads para armazenar imagens e texto extraído
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  imagem_url TEXT NOT NULL,
  texto_extraido TEXT,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuários vejam apenas seus próprios uploads
CREATE POLICY "Users can view their own uploads" 
  ON public.uploads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads" 
  ON public.uploads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads" 
  ON public.uploads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" 
  ON public.uploads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar bucket de storage para imagens
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-images', 'study-images', true);

-- Políticas para o bucket de imagens
CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'study-images' AND auth.uid() = owner);

CREATE POLICY "Users can view their own images"
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'study-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'study-images' AND auth.uid() = owner);
