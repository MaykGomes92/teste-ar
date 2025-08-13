-- Limpar funções anteriores e criar uma versão simplificada
DROP FUNCTION IF EXISTS public.populate_irb_template_data();
DROP FUNCTION IF EXISTS public.ensure_irb_data_populated();

-- Modificar a função de inicialização para incluir todos os dados
CREATE OR REPLACE FUNCTION public.initialize_irb_template_project()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    first_user_id UUID;
    project_id UUID := 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid;
BEGIN
    -- Buscar o primeiro usuário registrado ou usar o usuário autenticado atual
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não houver usuário, usar o usuário atual da sessão
    IF first_user_id IS NULL THEN
        first_user_id := auth.uid();
    END IF;
    
    -- Se ainda assim não houver usuário, sair da função
    IF first_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Verificar se o projeto já existe
    IF EXISTS (SELECT 1 FROM public.project_info WHERE id = project_id) THEN
        RETURN;
    END IF;
    
    -- Criar projeto template IRB(Re)
    INSERT INTO public.project_info (
        id, user_id, nome_projeto, cliente, data_inicio, data_fim, objetivo_projeto
    ) VALUES (
        project_id,
        first_user_id,
        'Mapeamento de Processos e Controles Internos - IRB(Re)',
        'IRB Brasil Resseguros S.A.',
        '2024-01-01',
        '2024-12-31',
        'Implementação de framework de controles internos baseado na metodologia COSO para identificação de riscos, mapeamento de processos e estabelecimento de controles efetivos para resseguros'
    );
    
    -- Criar detalhes do projeto
    INSERT INTO public.project_details (
        project_info_id, user_id, status_projeto, progresso_percentual,
        processos_mapeados, processos_meta, riscos_identificados, riscos_meta,
        controles_implementados, controles_meta, acoes_melhoria, acoes_melhoria_meta,
        escopo, premissas, restricoes, criterios_sucesso
    ) VALUES (
        project_id, first_user_id, 'Em Andamento', 75,
        7, 20, 7, 25, 7, 15, 5, 10,
        'Mapeamento completo dos processos críticos de negócio, identificação e avaliação de riscos operacionais, implementação de controles internos e testes de efetividade',
        'Disponibilidade de equipe técnica; Acesso às informações dos processos; Comprometimento da alta direção',
        'Orçamento limitado; Prazo de 12 meses; Recursos humanos disponíveis',
        'Redução de 30% nos riscos críticos; 100% dos processos mapeados; Controles implementados e testados'
    );
    
    -- Criar estruturas da cadeia de valor
    INSERT INTO public.estruturas_cadeia_valor (id, nome, descricao, cor, ordem, project_info_id) VALUES
    ('struct-01', 'Atividades Primárias', 'Processos que agregam valor diretamente ao cliente', '#3B82F6', 1, project_id),
    ('struct-02', 'Atividades de Apoio', 'Processos que suportam as atividades primárias', '#10B981', 2, project_id);
    
    -- Criar macro processos
    INSERT INTO public.macro_processos (id, nome, descricao, estrutura_id, project_info_id) VALUES
    ('MP-001', 'Subscrição', 'Processos relacionados à análise e aceitação de riscos', 'struct-01', project_id),
    ('MP-002', 'Sinistros', 'Processos de regulação e pagamento de sinistros', 'struct-01', project_id),
    ('MP-003', 'Resseguro', 'Processos de cessão e retrocessão de riscos', 'struct-01', project_id),
    ('MP-004', 'Gestão Financeira', 'Processos financeiros e contábeis', 'struct-02', project_id),
    ('MP-005', 'Gestão de Riscos', 'Processos de identificação e controle de riscos', 'struct-02', project_id);
    
    -- Criar processos detalhados
    INSERT INTO public.processos (id, nome, descricao, macro_processo, macro_processo_id, status, project_info_id, validacao_etapa) VALUES
    ('P-001-001', 'Análise de Propostas', 'Análise técnica e comercial de propostas de seguro', 'Subscrição', 'MP-001', 'Ativo', project_id, 3),
    ('P-001-002', 'Precificação', 'Cálculo de prêmios e definição de condições', 'Subscrição', 'MP-001', 'Ativo', project_id, 3),
    ('P-002-001', 'Abertura de Sinistros', 'Registro e classificação inicial de sinistros', 'Sinistros', 'MP-002', 'Ativo', project_id, 2),
    ('P-002-002', 'Regulação', 'Investigação e avaliação de sinistros', 'Sinistros', 'MP-002', 'Ativo', project_id, 2),
    ('P-003-001', 'Cessão Automática', 'Processo de cessão automática de riscos', 'Resseguro', 'MP-003', 'Ativo', project_id, 1),
    ('P-004-001', 'Faturamento', 'Emissão e cobrança de faturas', 'Gestão Financeira', 'MP-004', 'Ativo', project_id, 3),
    ('P-005-001', 'Monitoramento de Riscos', 'Identificação e monitoramento contínuo de riscos', 'Gestão de Riscos', 'MP-005', 'Ativo', project_id, 2);
    
    -- Associar usuário ao projeto
    INSERT INTO public.project_users (project_id, user_id, role) VALUES (project_id, first_user_id, 'admin');
    
END;
$$;