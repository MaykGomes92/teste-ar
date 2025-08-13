-- Criar tabelas para o módulo de Auditoria baseado no framework COSO

-- 1. Criar enum para tipos de teste de auditoria
CREATE TYPE public.audit_test_type AS ENUM ('desenho', 'efetividade');

-- 2. Criar enum para status de auditoria
CREATE TYPE public.audit_status AS ENUM ('planejado', 'em_andamento', 'concluido', 'pendente', 'cancelado');

-- 3. Criar enum para resultado de teste
CREATE TYPE public.test_result AS ENUM ('efetivo', 'inefetivo', 'parcialmente_efetivo', 'nao_testado');

-- 4. Tabela para cronograma anual de auditoria
CREATE TABLE public.audit_schedule (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    controle_id UUID REFERENCES public.kris(id) ON DELETE CASCADE,
    processo_id TEXT REFERENCES public.processos(id) ON DELETE CASCADE,
    audit_type audit_test_type NOT NULL,
    planned_date DATE,
    actual_date DATE,
    status audit_status DEFAULT 'planejado',
    auditor_name TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID,
    
    UNIQUE(project_info_id, controle_id, audit_type, year, quarter)
);

-- 5. Tabela para templates de processos de auditoria
CREATE TABLE public.audit_process_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    audit_type audit_test_type NOT NULL,
    methodology TEXT NOT NULL,
    procedures JSONB, -- Array de procedimentos
    required_evidences JSONB, -- Array de evidências necessárias
    estimated_hours INTEGER,
    periodicity TEXT, -- Mensal, Trimestral, Semestral, Anual
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID
);

-- 6. Tabela para execução de testes de auditoria
CREATE TABLE public.audit_tests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.audit_schedule(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.audit_process_templates(id),
    controle_id UUID REFERENCES public.kris(id) ON DELETE CASCADE,
    processo_id TEXT REFERENCES public.processos(id) ON DELETE CASCADE,
    risco_id UUID REFERENCES public.riscos(id),
    
    -- Informações do teste
    test_code TEXT,
    test_name TEXT NOT NULL,
    audit_type audit_test_type NOT NULL,
    methodology TEXT,
    procedures_executed TEXT,
    
    -- Execução
    auditor_name TEXT,
    reviewer_name TEXT,
    test_date DATE,
    completion_date DATE,
    
    -- Resultados
    test_result test_result DEFAULT 'nao_testado',
    effectiveness_score INTEGER CHECK (effectiveness_score BETWEEN 0 AND 100),
    findings TEXT,
    recommendations TEXT,
    
    -- Status e controle
    status audit_status DEFAULT 'planejado',
    is_critical BOOLEAN DEFAULT false,
    
    -- Evidências
    evidence_files JSONB, -- Array de arquivos de evidência
    evidence_names JSONB, -- Array de nomes de arquivos
    evidence_paths JSONB, -- Array de caminhos de arquivos
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID
);

-- 7. Tabela para planos de ação de auditoria
CREATE TABLE public.audit_action_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_info_id UUID REFERENCES public.project_info(id) ON DELETE CASCADE,
    audit_test_id UUID REFERENCES public.audit_tests(id) ON DELETE CASCADE,
    controle_id UUID REFERENCES public.kris(id),
    
    -- Informações do plano
    action_code TEXT,
    finding_description TEXT NOT NULL,
    root_cause TEXT,
    recommended_action TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('Alta', 'Média', 'Baixa')) DEFAULT 'Média',
    
    -- Responsabilidades
    responsible_person TEXT,
    reviewer_person TEXT,
    
    -- Prazos
    due_date DATE,
    completion_date DATE,
    
    -- Status
    status TEXT CHECK (status IN ('Aberto', 'Em Andamento', 'Concluído', 'Cancelado')) DEFAULT 'Aberto',
    
    -- Acompanhamento
    progress_percentage INTEGER CHECK (progress_percentage BETWEEN 0 AND 100) DEFAULT 0,
    implementation_evidence TEXT,
    follow_up_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID
);

-- Criar índices para performance
CREATE INDEX idx_audit_schedule_project_year ON public.audit_schedule(project_info_id, year);
CREATE INDEX idx_audit_schedule_controle ON public.audit_schedule(controle_id);
CREATE INDEX idx_audit_tests_project ON public.audit_tests(project_info_id);
CREATE INDEX idx_audit_tests_schedule ON public.audit_tests(schedule_id);
CREATE INDEX idx_audit_tests_status ON public.audit_tests(status);
CREATE INDEX idx_audit_action_plans_project ON public.audit_action_plans(project_info_id);
CREATE INDEX idx_audit_action_plans_test ON public.audit_action_plans(audit_test_id);
CREATE INDEX idx_audit_action_plans_status ON public.audit_action_plans(status);

-- Habilitar RLS
ALTER TABLE public.audit_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_action_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_schedule
CREATE POLICY "Users can view audit schedule in their projects" 
ON public.audit_schedule FOR SELECT 
USING (project_info_id IN (
    SELECT project_id FROM public.project_users WHERE user_id = auth.uid()
));

CREATE POLICY "Project users can manage audit schedule" 
ON public.audit_schedule FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = audit_schedule.project_info_id 
    AND pu.user_id = auth.uid() 
    AND pu.role IN ('admin', 'manager', 'user')
));

-- Políticas RLS para audit_process_templates
CREATE POLICY "Users can view audit templates in their projects" 
ON public.audit_process_templates FOR SELECT 
USING (project_info_id IN (
    SELECT project_id FROM public.project_users WHERE user_id = auth.uid()
));

CREATE POLICY "Project users can manage audit templates" 
ON public.audit_process_templates FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = audit_process_templates.project_info_id 
    AND pu.user_id = auth.uid() 
    AND pu.role IN ('admin', 'manager', 'user')
));

-- Políticas RLS para audit_tests
CREATE POLICY "Users can view audit tests in their projects" 
ON public.audit_tests FOR SELECT 
USING (project_info_id IN (
    SELECT project_id FROM public.project_users WHERE user_id = auth.uid()
));

CREATE POLICY "Project users can manage audit tests" 
ON public.audit_tests FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = audit_tests.project_info_id 
    AND pu.user_id = auth.uid() 
    AND pu.role IN ('admin', 'manager', 'user')
));

-- Políticas RLS para audit_action_plans
CREATE POLICY "Users can view audit action plans in their projects" 
ON public.audit_action_plans FOR SELECT 
USING (project_info_id IN (
    SELECT project_id FROM public.project_users WHERE user_id = auth.uid()
));

CREATE POLICY "Project users can manage audit action plans" 
ON public.audit_action_plans FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = audit_action_plans.project_info_id 
    AND pu.user_id = auth.uid() 
    AND pu.role IN ('admin', 'manager', 'user')
));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_audit_schedule_updated_at
    BEFORE UPDATE ON public.audit_schedule
    FOR EACH ROW EXECUTE FUNCTION public.update_audit_updated_at();

CREATE TRIGGER update_audit_templates_updated_at
    BEFORE UPDATE ON public.audit_process_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_audit_updated_at();

CREATE TRIGGER update_audit_tests_updated_at
    BEFORE UPDATE ON public.audit_tests
    FOR EACH ROW EXECUTE FUNCTION public.update_audit_updated_at();

CREATE TRIGGER update_audit_action_plans_updated_at
    BEFORE UPDATE ON public.audit_action_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_audit_updated_at();