
-- Criar tabela para controle de uso por usuário
CREATE TABLE public.uso_usuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  uploads_realizados INTEGER NOT NULL DEFAULT 0,
  flashcards_gerados INTEGER NOT NULL DEFAULT 0,
  quizzes_realizados INTEGER NOT NULL DEFAULT 0,
  data_ultimo_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  plano TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.uso_usuarios ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view their own usage data" 
  ON public.uso_usuarios 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios registros
CREATE POLICY "Users can create their own usage data" 
  ON public.uso_usuarios 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Users can update their own usage data" 
  ON public.uso_usuarios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar índice único para user_id
CREATE UNIQUE INDEX idx_uso_usuarios_user_id ON public.uso_usuarios(user_id);

-- Função para inicializar registro de uso quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.uso_usuarios (user_id, plano)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;

-- Trigger para criar registro de uso automaticamente
CREATE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_usage();

-- Função para resetar contadores mensalmente
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.uso_usuarios
  SET 
    uploads_realizados = 0,
    flashcards_gerados = 0,
    quizzes_realizados = 0,
    data_ultimo_reset = CURRENT_DATE,
    updated_at = now()
  WHERE data_ultimo_reset <= CURRENT_DATE - INTERVAL '30 days';
END;
$$;
