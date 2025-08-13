-- Criar tabela para normas e procedimentos
CREATE TABLE public.normas_procedimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_info_id UUID REFERENCES public.project_info(id),
  user_id UUID REFERENCES auth.users(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('norma', 'procedimento')),
  codigo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel TEXT,
  area TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'revisao', 'obsoleto', 'expirado')),
  arquivo_path TEXT,
  arquivo_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para versionamento
CREATE TABLE public.normas_procedimentos_versoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  norma_procedimento_id UUID NOT NULL REFERENCES public.normas_procedimentos(id) ON DELETE CASCADE,
  versao TEXT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  data_expiracao DATE,
  data_aprovacao DATE,
  proxima_revisao DATE,
  aprovado_por TEXT,
  observacoes TEXT,
  arquivo_path TEXT,
  arquivo_name TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_normas_procedimentos_project ON public.normas_procedimentos(project_info_id);
CREATE INDEX idx_normas_procedimentos_tipo ON public.normas_procedimentos(tipo);
CREATE INDEX idx_normas_procedimentos_status ON public.normas_procedimentos(status);
CREATE INDEX idx_normas_versoes_norma_id ON public.normas_procedimentos_versoes(norma_procedimento_id);
CREATE INDEX idx_normas_versoes_ativo ON public.normas_procedimentos_versoes(ativo);

-- RLS policies para normas_procedimentos
ALTER TABLE public.normas_procedimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view normas in their projects" 
ON public.normas_procedimentos 
FOR SELECT 
USING (
  project_info_id IN (
    SELECT project_users.project_id
    FROM project_users
    WHERE project_users.user_id = auth.uid()
  )
);

CREATE POLICY "Project users can manage normas" 
ON public.normas_procedimentos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM project_users pu
    WHERE pu.project_id = normas_procedimentos.project_info_id 
    AND pu.user_id = auth.uid() 
    AND pu.role IN ('admin', 'manager', 'user')
  )
);

-- RLS policies para versões
ALTER TABLE public.normas_procedimentos_versoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versoes in their projects" 
ON public.normas_procedimentos_versoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM normas_procedimentos np
    JOIN project_users pu ON pu.project_id = np.project_info_id
    WHERE np.id = normas_procedimentos_versoes.norma_procedimento_id
    AND pu.user_id = auth.uid()
  )
);

CREATE POLICY "Project users can manage versoes" 
ON public.normas_procedimentos_versoes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1
    FROM normas_procedimentos np
    JOIN project_users pu ON pu.project_id = np.project_info_id
    WHERE np.id = normas_procedimentos_versoes.norma_procedimento_id
    AND pu.user_id = auth.uid()
    AND pu.role IN ('admin', 'manager', 'user')
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_normas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_normas_procedimentos_updated_at
  BEFORE UPDATE ON public.normas_procedimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_normas_updated_at();

CREATE TRIGGER update_normas_versoes_updated_at
  BEFORE UPDATE ON public.normas_procedimentos_versoes
  FOR EACH ROW
  EXECUTE FUNCTION update_normas_updated_at();

-- Trigger para verificar datas de expiração
CREATE OR REPLACE FUNCTION check_norma_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar status para expirado se a data de expiração passou
  IF NEW.data_expiracao IS NOT NULL AND NEW.data_expiracao < CURRENT_DATE THEN
    UPDATE public.normas_procedimentos 
    SET status = 'expirado'
    WHERE id = NEW.norma_procedimento_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_norma_expiration_trigger
  AFTER INSERT OR UPDATE ON public.normas_procedimentos_versoes
  FOR EACH ROW
  EXECUTE FUNCTION check_norma_expiration();

-- Função para criar nova versão
CREATE OR REPLACE FUNCTION create_new_version(
  p_norma_id UUID,
  p_versao TEXT,
  p_data_inicio DATE DEFAULT CURRENT_DATE,
  p_data_expiracao DATE DEFAULT NULL,
  p_aprovado_por TEXT DEFAULT NULL,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_version_id UUID;
BEGIN
  -- Desativar versão anterior
  UPDATE public.normas_procedimentos_versoes 
  SET ativo = false, data_fim = CURRENT_DATE
  WHERE norma_procedimento_id = p_norma_id AND ativo = true;
  
  -- Criar nova versão
  INSERT INTO public.normas_procedimentos_versoes (
    norma_procedimento_id,
    versao,
    data_inicio,
    data_expiracao,
    aprovado_por,
    observacoes,
    ativo
  ) VALUES (
    p_norma_id,
    p_versao,
    p_data_inicio,
    p_data_expiracao,
    p_aprovado_por,
    p_observacoes,
    true
  ) RETURNING id INTO v_version_id;
  
  RETURN v_version_id;
END;
$$;