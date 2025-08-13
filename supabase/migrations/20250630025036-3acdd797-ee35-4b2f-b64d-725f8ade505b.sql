
-- Criar tabela de riscos
CREATE TABLE IF NOT EXISTS public.riscos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    descricao text,
    categoria text NOT NULL,
    nivel_impacto text NOT NULL,
    probabilidade text NOT NULL,
    status text NOT NULL DEFAULT 'Identificado',
    processo_id text,
    responsavel text,
    data_identificacao date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Adicionar coluna risco_id na tabela kris
ALTER TABLE public.kris 
ADD COLUMN IF NOT EXISTS risco_id uuid REFERENCES public.riscos(id);

-- Inserir alguns riscos exemplo para teste
INSERT INTO public.riscos (nome, descricao, categoria, nivel_impacto, probabilidade, status, processo_id) 
VALUES 
    ('Falha de Sistema Crítico', 'Risco de indisponibilidade do sistema principal de negócios', 'Tecnológico', 'Alto', 'Médio', 'Identificado', 'P-005'),
    ('Perda de Dados Sensíveis', 'Risco de vazamento ou corrupção de dados críticos', 'Segurança', 'Muito Alto', 'Baixo', 'Identificado', 'P-005'),
    ('Atraso em Entregas', 'Risco de não cumprimento de prazos de entrega', 'Operacional', 'Médio', 'Alto', 'Monitorado', 'P-003'),
    ('Flutuação Cambial', 'Risco financeiro por variação nas taxas de câmbio', 'Financeiro', 'Alto', 'Médio', 'Identificado', 'P-006'),
    ('Perda de Pessoal Chave', 'Risco de saída de funcionários críticos', 'Estratégico', 'Alto', 'Médio', 'Identificado', 'P-004')
ON CONFLICT DO NOTHING;
