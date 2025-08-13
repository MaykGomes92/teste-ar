
-- Criar tabela para armazenar informações completas do projeto
CREATE TABLE public.project_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Informações adicionais do projeto
  descricao_detalhada TEXT,
  escopo TEXT,
  restricoes TEXT,
  premissas TEXT,
  criterios_sucesso TEXT,
  
  -- Status e progresso
  status_projeto TEXT DEFAULT 'Em Planejamento',
  progresso_percentual INTEGER DEFAULT 0,
  
  -- Métricas de progresso
  processos_mapeados INTEGER DEFAULT 0,
  processos_meta INTEGER DEFAULT 0,
  riscos_identificados INTEGER DEFAULT 0,
  riscos_meta INTEGER DEFAULT 0,
  controles_implementados INTEGER DEFAULT 0,
  controles_meta INTEGER DEFAULT 0,
  acoes_melhoria INTEGER DEFAULT 0,
  acoes_melhoria_meta INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.project_details ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas detalhes de seus próprios projetos
CREATE POLICY "Users can view their own project details" 
  ON public.project_details 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );

-- Política para permitir que usuários insiram detalhes de seus próprios projetos
CREATE POLICY "Users can create their own project details" 
  ON public.project_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem detalhes de seus próprios projetos
CREATE POLICY "Users can update their own project details" 
  ON public.project_details 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );

-- Política para permitir que usuários deletem detalhes de seus próprios projetos
CREATE POLICY "Users can delete their own project details" 
  ON public.project_details 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );

-- Criar tabela para histórico de mudanças no projeto
CREATE TABLE public.project_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Detalhes da mudança
  tipo_mudanca TEXT NOT NULL, -- 'criacao', 'atualizacao', 'status_change', etc.
  descricao_mudanca TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS) para histórico
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam histórico de seus próprios projetos
CREATE POLICY "Users can view their own project history" 
  ON public.project_history 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );

-- Política para permitir inserção no histórico
CREATE POLICY "Users can create project history entries" 
  ON public.project_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Adicionar colunas de relacionamento às tabelas existentes para vincular ao projeto
ALTER TABLE public.processos ADD COLUMN IF NOT EXISTS project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE;
ALTER TABLE public.riscos ADD COLUMN IF NOT EXISTS project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE;
ALTER TABLE public.kris ADD COLUMN IF NOT EXISTS project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE;

-- Criar função para atualizar automaticamente as métricas do projeto
CREATE OR REPLACE FUNCTION update_project_metrics(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.project_details 
  SET 
    processos_mapeados = (
      SELECT COUNT(*) FROM public.processos 
      WHERE project_info_id = project_id AND status = 'Ativo'
    ),
    riscos_identificados = (
      SELECT COUNT(*) FROM public.riscos 
      WHERE project_info_id = project_id
    ),
    controles_implementados = (
      SELECT COUNT(*) FROM public.kris 
      WHERE project_info_id = project_id AND status = 'Ativo'
    ),
    updated_at = now()
  WHERE project_info_id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
