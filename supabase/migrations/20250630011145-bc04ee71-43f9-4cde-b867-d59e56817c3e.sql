
-- Criar tabela para armazenar informações do projeto
CREATE TABLE public.project_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome_projeto TEXT NOT NULL,
  cliente TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  sponsor_principal UUID REFERENCES public.profiles(id),
  objetivo_projeto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.project_info ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios projetos
CREATE POLICY "Users can view their own project info" 
  ON public.project_info 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios projetos
CREATE POLICY "Users can create their own project info" 
  ON public.project_info 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios projetos
CREATE POLICY "Users can update their own project info" 
  ON public.project_info 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios projetos
CREATE POLICY "Users can delete their own project info" 
  ON public.project_info 
  FOR DELETE 
  USING (auth.uid() = user_id);
