-- Adicionar dados complementares ao projeto IRB(Re)
CREATE OR REPLACE FUNCTION public.populate_irb_template_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    project_id UUID := 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid;
BEGIN
    -- Verificar se o projeto existe antes de continuar
    IF NOT EXISTS (SELECT 1 FROM public.project_info WHERE id = project_id) THEN
        RETURN;
    END IF;
    
    -- Criar riscos identificados
    INSERT INTO public.riscos (nome, categoria, nivel_impacto, probabilidade, processo_id, project_info_id, status, codigo, causas, consequencias, area) VALUES
    ('Falha na Análise de Risco', 'Operacional', 'Alto', 'Média', 'P-001-001', project_id, 'Identificado', 'R-001', 'Falta de expertise técnica, pressão comercial', 'Subscrição inadequada, prejuízos financeiros', 'Subscrição'),
    ('Fraude em Sinistros', 'Operacional', 'Alto', 'Média', 'P-002-001', project_id, 'Identificado', 'R-002', 'Controles inadequados, falta de investigação', 'Pagamentos indevidos, perdas financeiras', 'Sinistros'),
    ('Falha em Sistemas de TI', 'Tecnológico', 'Alto', 'Baixa', 'P-004-001', project_id, 'Identificado', 'R-003', 'Obsolescência tecnológica, falta de manutenção', 'Interrupção de operações, perda de dados', 'TI'),
    ('Concentração de Riscos', 'Estratégico', 'Médio', 'Média', 'P-003-001', project_id, 'Identificado', 'R-004', 'Falta de diversificação, limites inadequados', 'Exposição excessiva, volatilidade de resultados', 'Resseguro'),
    ('Inadimplência', 'Crédito', 'Médio', 'Média', 'P-004-001', project_id, 'Identificado', 'R-005', 'Análise de crédito inadequada, crise econômica', 'Redução de fluxo de caixa, provisões', 'Financeiro'),
    ('Catástrofes Naturais', 'Operacional', 'Alto', 'Baixa', 'P-003-001', project_id, 'Identificado', 'R-006', 'Mudanças climáticas, eventos extremos', 'Grandes sinistros, impacto no resultado', 'Subscrição'),
    ('Risco Regulatório', 'Conformidade', 'Médio', 'Alta', 'P-005-001', project_id, 'Identificado', 'R-007', 'Mudanças na legislação, novas exigências', 'Multas, adequações custosas', 'Regulatório')
    ON CONFLICT DO NOTHING;
    
    -- Criar controles/KRIs
    INSERT INTO public.kris (nome, categoria, descricao, frequencia_medicao, tipo_medicao, processo_id, project_info_id, status, codigo, responsavel, validacao_etapa) VALUES
    ('Comitê de Subscrição', 'Operacional', 'Aprovação colegiada para riscos acima de limites estabelecidos', 'Mensal', 'Qualitativo', 'P-001-001', project_id, 'Ativo', 'C-001', 'Gerente de Subscrição', 2),
    ('Sistema de Detecção de Fraudes', 'Tecnológico', 'Análise automatizada de padrões suspeitos em sinistros', 'Diário', 'Quantitativo', 'P-002-001', project_id, 'Ativo', 'C-002', 'Analista de Sinistros', 3),
    ('Backup e Recuperação', 'Tecnológico', 'Rotinas automáticas de backup e testes de recuperação', 'Diário', 'Quantitativo', 'P-004-001', project_id, 'Ativo', 'C-003', 'Coordenador de TI', 2),
    ('Limites de Retenção', 'Operacional', 'Definição e monitoramento de limites por tipo de risco', 'Mensal', 'Quantitativo', 'P-003-001', project_id, 'Ativo', 'C-004', 'Gerente de Resseguro', 1),
    ('Análise de Crédito', 'Financeiro', 'Avaliação da capacidade de pagamento dos segurados', 'Mensal', 'Qualitativo', 'P-004-001', project_id, 'Ativo', 'C-005', 'Analista Financeiro', 2),
    ('Modelo de Precificação', 'Operacional', 'Modelos atuariais para precificação adequada', 'Trimestral', 'Quantitativo', 'P-001-002', project_id, 'Ativo', 'C-006', 'Atuário Chefe', 3),
    ('Controle de Provisões', 'Financeiro', 'Acompanhamento e adequação de provisões técnicas', 'Mensal', 'Quantitativo', 'P-002-002', project_id, 'Ativo', 'C-007', 'Controller', 2)
    ON CONFLICT DO NOTHING;
    
    -- Criar ações de melhoria
    INSERT INTO public.melhorias (nome, descricao, status, responsavel, project_info_id, validacao_etapa) VALUES
    ('Implementar IA na Análise de Riscos', 'Desenvolvimento de sistema de inteligência artificial para apoio à análise de propostas', 'Planejado', 'Diretor de TI', project_id, 1),
    ('Certificação ISO 27001', 'Obtenção de certificação de segurança da informação', 'Em Desenvolvimento', 'CISO', project_id, 2),
    ('Dashboard Executivo', 'Criação de painel executivo com métricas em tempo real', 'Implementado', 'Gerente de BI', project_id, 3),
    ('Automação de Regulação', 'Implementação de RPA para regulação de sinistros simples', 'Planejado', 'Gerente de Sinistros', project_id, 1),
    ('Plataforma Digital', 'Desenvolvimento de portal digital para corretores', 'Em Desenvolvimento', 'Diretor Comercial', project_id, 2)
    ON CONFLICT DO NOTHING;
    
    -- Criar dados de planilhas
    INSERT INTO public.dados_planilhas (nome_planilha, descricao, macro_processo, processo_nome, processo_id, project_info_id, status, criticidade, responsavel_manutencao, frequencia_atualizacao, validacao_etapa) VALUES
    ('Relatório de Prêmios', 'Controle mensal de prêmios emitidos por produto', 'Subscrição', 'Análise de Propostas', 'P-001-001', project_id, 'Ativo', 'Alta', 'Analista de Subscrição', 'Mensal', 2),
    ('Controle de Sinistros IBNR', 'Estimativa de sinistros ocorridos mas não reportados', 'Sinistros', 'Regulação', 'P-002-002', project_id, 'Ativo', 'Crítica', 'Atuário Sênior', 'Mensal', 3),
    ('Posição de Resseguro', 'Controle de cessões e recuperações de resseguro', 'Resseguro', 'Cessão Automática', 'P-003-001', project_id, 'Ativo', 'Alta', 'Analista de Resseguro', 'Diário', 2),
    ('Demonstrativo Financeiro', 'Controle de receitas e despesas por linha de negócio', 'Gestão Financeira', 'Faturamento', 'P-004-001', project_id, 'Ativo', 'Alta', 'Controller', 'Mensal', 3),
    ('Mapa de Riscos', 'Identificação e classificação de riscos por processo', 'Gestão de Riscos', 'Monitoramento de Riscos', 'P-005-001', project_id, 'Ativo', 'Crítica', 'Risk Manager', 'Trimestral', 2)
    ON CONFLICT DO NOTHING;
    
END;
$$;

-- Executar a função para popular os dados
SELECT public.populate_irb_template_data();

-- Criar função para executar quando um usuário acessar o sistema
CREATE OR REPLACE FUNCTION public.ensure_irb_data_populated()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se os dados já foram populados
    IF NOT EXISTS (SELECT 1 FROM public.riscos WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid) THEN
        PERFORM public.populate_irb_template_data();
    END IF;
END;
$$;