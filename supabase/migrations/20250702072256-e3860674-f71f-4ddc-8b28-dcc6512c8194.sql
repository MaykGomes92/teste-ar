-- Criar tabela para documentação de planilhas e dados de TI
CREATE TABLE public.dados_planilhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_info_id UUID REFERENCES public.project_info(id),
  user_id UUID REFERENCES auth.users(id),
  macro_processo TEXT NOT NULL,
  processo_id TEXT REFERENCES public.processos(id),
  processo_nome TEXT NOT NULL,
  nome_planilha TEXT NOT NULL,
  descricao TEXT,
  tipo_dados TEXT, -- Ex: Operacional, Financeiro, Compliance, etc.
  sistema_origem TEXT, -- Sistema de origem da planilha
  responsavel_manutencao TEXT,
  frequencia_atualizacao TEXT, -- Diária, Semanal, Mensal, etc.
  criticidade TEXT DEFAULT 'Média', -- Alta, Média, Baixa
  validacao_etapa INTEGER DEFAULT 0, -- 0-4 como solicitado
  status TEXT DEFAULT 'Ativo',
  evidencia_names TEXT[],
  evidencia_paths TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.dados_planilhas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view planilhas in their projects"
ON public.dados_planilhas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_users pu
    WHERE pu.project_id = dados_planilhas.project_info_id
    AND pu.user_id = auth.uid()
  )
);

CREATE POLICY "Project users can insert planilhas"
ON public.dados_planilhas
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_users pu
    WHERE pu.project_id = dados_planilhas.project_info_id
    AND pu.user_id = auth.uid()
    AND pu.role IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY "Project users can update planilhas"
ON public.dados_planilhas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.project_users pu
    WHERE pu.project_id = dados_planilhas.project_info_id
    AND pu.user_id = auth.uid()
    AND pu.role IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY "Project users can delete planilhas"
ON public.dados_planilhas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.project_users pu
    WHERE pu.project_id = dados_planilhas.project_info_id
    AND pu.user_id = auth.uid()
    AND pu.role IN ('admin', 'manager')
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_dados_planilhas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dados_planilhas_updated_at
  BEFORE UPDATE ON public.dados_planilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dados_planilhas_updated_at();

-- Criar bucket de storage para evidências de planilhas se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dados-evidencias', 'dados-evidencias', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para evidências
CREATE POLICY "Users can view their project evidences"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'dados-evidencias' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload evidences"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dados-evidencias' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their evidences"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'dados-evidencias' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their evidences"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dados-evidencias' AND
  auth.uid()::text = (storage.foldername(name))[1]
);