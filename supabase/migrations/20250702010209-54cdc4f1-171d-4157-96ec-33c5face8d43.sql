-- Adicionar campo de validação sequencial nas tabelas principais
ALTER TABLE public.processos 
ADD COLUMN validacao_etapa INTEGER DEFAULT 0 CHECK (validacao_etapa >= 0 AND validacao_etapa <= 4);

ALTER TABLE public.riscos 
ADD COLUMN validacao_etapa INTEGER DEFAULT 0 CHECK (validacao_etapa >= 0 AND validacao_etapa <= 4);

ALTER TABLE public.kris 
ADD COLUMN validacao_etapa INTEGER DEFAULT 0 CHECK (validacao_etapa >= 0 AND validacao_etapa <= 4);

-- Criar tabela para melhorias
CREATE TABLE public.melhorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  processo_id TEXT,
  responsavel TEXT,
  status TEXT DEFAULT 'Planejado',
  validacao_etapa INTEGER DEFAULT 0 CHECK (validacao_etapa >= 0 AND validacao_etapa <= 4),
  project_info_id UUID REFERENCES public.project_info(id),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para testes
CREATE TABLE public.testes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  controle_id UUID REFERENCES public.kris(id),
  processo_id TEXT,
  procedimento_realizado TEXT,
  data_execucao DATE,
  executor TEXT,
  revisor TEXT,
  maturidade INTEGER CHECK (maturidade IN (0, 1, 2, 3, 5)),
  mitigacao INTEGER CHECK (mitigacao >= 1 AND mitigacao <= 4),
  validacao_etapa INTEGER DEFAULT 0 CHECK (validacao_etapa >= 0 AND validacao_etapa <= 4),
  project_info_id UUID REFERENCES public.project_info(id),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.melhorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para melhorias
CREATE POLICY "Usuários podem ver todas as melhorias" 
ON public.melhorias FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir melhorias" 
ON public.melhorias FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar melhorias" 
ON public.melhorias FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar melhorias" 
ON public.melhorias FOR DELETE USING (true);

-- Políticas RLS para testes
CREATE POLICY "Usuários podem ver todos os testes" 
ON public.testes FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem inserir testes" 
ON public.testes FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar testes" 
ON public.testes FOR UPDATE USING (true);

CREATE POLICY "Usuários autenticados podem deletar testes" 
ON public.testes FOR DELETE USING (true);