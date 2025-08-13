
-- Criar tabela para KRIs (Key Risk Indicators)
CREATE TABLE public.kris (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  tipo_medicao TEXT NOT NULL, -- percentual, valor, contagem, etc.
  frequencia_medicao TEXT NOT NULL, -- diaria, semanal, mensal, trimestral
  meta_tier1 DECIMAL,
  meta_tier2 DECIMAL,
  meta_tier3 DECIMAL,
  referencia_mercado TEXT,
  processo_id TEXT,
  responsavel TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.kris ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para KRIs
CREATE POLICY "Todos podem visualizar KRIs" 
  ON public.kris 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir KRIs" 
  ON public.kris 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar KRIs" 
  ON public.kris 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar KRIs" 
  ON public.kris 
  FOR DELETE 
  TO authenticated
  USING (true);
