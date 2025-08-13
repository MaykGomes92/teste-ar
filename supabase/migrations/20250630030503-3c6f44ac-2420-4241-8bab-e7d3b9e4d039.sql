
-- Habilitar RLS nas tabelas que não têm
ALTER TABLE public.riscos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_info ENABLE ROW LEVEL SECURITY;

-- Criar tabela de processos para normalizar os vínculos
CREATE TABLE IF NOT EXISTS public.processos (
    id text PRIMARY KEY,
    nome text NOT NULL,
    descricao text,
    macro_processo text NOT NULL,
    responsavel text,
    status text NOT NULL DEFAULT 'Ativo',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Inserir os processos que já estão sendo usados no sistema
INSERT INTO public.processos (id, nome, macro_processo) VALUES 
    ('P-001', 'P-001 - Gestão Comercial', 'Processos Primários'),
    ('P-002', 'P-002 - Produção', 'Processos Primários'),
    ('P-003', 'P-003 - Logística', 'Processos Primários'),
    ('P-004', 'P-004 - Recursos Humanos', 'Processos de Apoio'),
    ('P-005', 'P-005 - Tecnologia da Informação', 'Processos de Apoio'),
    ('P-006', 'P-006 - Financeiro', 'Processos de Apoio'),
    ('P-007', 'P-007 - Planejamento Estratégico', 'Processos de Gestão'),
    ('P-008', 'P-008 - Gestão da Qualidade', 'Processos de Gestão')
ON CONFLICT (id) DO NOTHING;

-- Adicionar foreign keys para processo_id nas tabelas existentes
ALTER TABLE public.riscos 
ADD CONSTRAINT fk_riscos_processo 
foreign key (processo_id) REFERENCES public.processos(id);

ALTER TABLE public.kris 
ADD CONSTRAINT fk_kris_processo 
foreign key (processo_id) REFERENCES public.processos(id);

-- Adicionar campos de controle nas tabelas que não têm
ALTER TABLE public.riscos ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.kris ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Criar políticas RLS para riscos
CREATE POLICY "Usuários podem ver todos os riscos" 
  ON public.riscos FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir riscos" 
  ON public.riscos FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar riscos" 
  ON public.riscos FOR UPDATE 
  TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar riscos" 
  ON public.riscos FOR DELETE 
  TO authenticated USING (true);

-- Criar políticas RLS para profiles
CREATE POLICY "Usuários podem ver todos os perfis" 
  ON public.profiles FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "Usuários autenticados podem inserir perfis" 
  ON public.profiles FOR INSERT 
  TO authenticated WITH CHECK (true);

-- Criar políticas RLS para project_info
CREATE POLICY "Usuários podem ver informações do projeto" 
  ON public.project_info FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Criador do projeto pode atualizá-lo" 
  ON public.project_info FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem inserir projetos" 
  ON public.project_info FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Criar políticas RLS para processos
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver todos os processos" 
  ON public.processos FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir processos" 
  ON public.processos FOR INSERT 
  TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar processos" 
  ON public.processos FOR UPDATE 
  TO authenticated USING (true);
