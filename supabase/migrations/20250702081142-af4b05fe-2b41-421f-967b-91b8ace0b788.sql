-- Adicionar dados corrigidos para demonstração TechCorp

-- Riscos fictícios
INSERT INTO public.riscos (nome, descricao, categoria, nivel_impacto, probabilidade, status, processo_id, project_info_id, responsavel, data_identificacao, validacao_etapa) VALUES 
('Risco de Subscrição Inadequada', 'TechCorp: Risco de aceitar riscos fora do apetite da companhia ou com precificação inadequada', 'Risco Operacional', 'Alto', 'Média', 'Identificado', 'SUB-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Gerência TechCorp - Subscrição', '2024-02-01', 2),
('Risco de Fraude em Sinistros', 'TechCorp: Risco de pagamento de sinistros fraudulentos ou superfaturados', 'Risco Operacional', 'Alto', 'Média', 'Em Mitigação', 'REG-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Gerência TechCorp - Sinistros', '2024-02-01', 2),
('Risco de Mercado', 'TechCorp: Risco de perda na carteira de investimentos devido a variações de mercado', 'Risco de Mercado', 'Alto', 'Alta', 'Monitorado', 'INV-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Gerência TechCorp - Investimentos', '2024-02-01', 2),
('Risco de Crédito', 'TechCorp: Risco de default de contrapartes nos investimentos', 'Risco de Crédito', 'Médio', 'Baixa', 'Identificado', 'CRE-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Gerência TechCorp - Risco', '2024-02-01', 2),
('Risco de Compliance', 'TechCorp: Risco de não conformidade com regulamentações vigentes', 'Risco de Compliance', 'Alto', 'Baixa', 'Em Mitigação', 'COM-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Gerência TechCorp - Compliance', '2024-02-01', 2);

-- KRIs/Controles fictícios
INSERT INTO public.kris (nome, descricao, categoria, tipo_medicao, frequencia_medicao, status, processo_id, project_info_id, responsavel, meta_tier1, meta_tier2, meta_tier3, validacao_etapa) VALUES 
('Taxa de Sinistralidade', 'TechCorp: Monitoramento da relação entre sinistros pagos e prêmios ganhos', 'KRI Operacional', 'Percentual', 'Mensal', 'Ativo', 'REG-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Controles TechCorp - Atuária', 60, 70, 80, 2),
('Índice de Aprovação Automática', 'TechCorp: Percentual de cotações aprovadas automaticamente pelo sistema', 'KRI Operacional', 'Percentual', 'Diário', 'Ativo', 'SUB-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Controles TechCorp - Subscrição', 85, 75, 65, 2),
('Duration da Carteira', 'TechCorp: Duração modificada da carteira de investimentos', 'KRI Mercado', 'Numérico', 'Diário', 'Ativo', 'INV-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Controles TechCorp - Investimentos', 3.5, 4.0, 4.5, 2),
('Tempo Médio de Regulação', 'TechCorp: Tempo médio para regulação de sinistros em dias', 'KRI Operacional', 'Dias', 'Semanal', 'Ativo', 'REG-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Controles TechCorp - Sinistros', 15, 20, 25, 2),
('Índice de Conformidade Regulatória', 'TechCorp: Percentual de adequação às normas regulamentares', 'KRI Compliance', 'Percentual', 'Mensal', 'Ativo', 'COM-DEM', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 'Controles TechCorp - Compliance', 95, 90, 85, 2);

-- Dados de planilhas
INSERT INTO public.dados_planilhas (
  macro_processo, processo_nome, processo_id, nome_planilha, status, criticidade, 
  frequencia_atualizacao, responsavel_manutencao, sistema_origem, tipo_dados, 
  descricao, project_info_id, validacao_etapa, observacoes
) VALUES 
('Subscrição', 'Análise de Risco de Subscrição', 'SUB-DEM', 'Matriz Tarifária Automóvel', 'Ativo', 'Alta', 'Mensal', 'Atuário Senior - Carlos Silva', 'Sistema Tarifário', 'Dados Estratégicos', 'Planilha com parâmetros tarifários para produtos automóvel, incluindo fatores de risco, loading comercial e margem técnica', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Atualizada conforme novas análises de mercado'),
('Subscrição', 'Processo de Cotação', 'COT-DEM', 'Base Histórica de Cotações', 'Ativo', 'Média', 'Diária', 'Coordenador Comercial - Ana Santos', 'CRM Vendas', 'Dados Operacionais', 'Histórico completo de cotações realizadas nos últimos 24 meses', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Integrada automaticamente via API'),
('Sinistros', 'Regulação de Sinistros', 'REG-DEM', 'Controle de Reservas IBNR', 'Ativo', 'Alta', 'Semanal', 'Gerente Técnico - Roberto Lima', 'Sistema Sinistros', 'Dados Regulatórios', 'Planilha de controle das reservas IBNR com metodologia atuarial', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Validada mensalmente pelo Comitê de Riscos'),
('Investimentos', 'Gestão de Portfólio', 'INV-DEM', 'Posição Consolidada de Investimentos', 'Ativo', 'Alta', 'Diária', 'Gestor de Investimentos - Fernando Alves', 'Sistema Bloomberg', 'Dados Financeiros', 'Posição detalhada de todos os ativos da carteira', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Marcação a mercado em tempo real');

-- Testes de controles (valores ajustados para atender constraints)
INSERT INTO public.testes (
  nome, descricao, processo_id, data_execucao, executor, revisor, 
  maturidade, mitigacao, procedimento_realizado, project_info_id, validacao_etapa
) VALUES 
('Teste de Validação Tarifária', 'Verificação da aplicação correta dos fatores de risco na precificação', 'SUB-DEM', '2024-01-15', 'Auditor Junior - Lucas Ferreira', 'Auditor Senior - Renata Oliveira', 4, 4, 'Análise de amostra de 50 cotações, verificando aplicação de fatores de risco e cálculos. Todas as cotações testadas apresentaram cálculos corretos.', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3),
('Teste de Constituição de Reservas', 'Validação do cálculo de reservas IBNR conforme metodologia atuarial', 'REG-DEM', '2024-01-20', 'Atuário Pleno - Marina Santos', 'Atuário Senior - João Pedro', 5, 4, 'Revisão completa da metodologia de cálculo de IBNR. Metodologia aprovada pelo Comitê de Riscos.', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3);

-- Ações de melhoria
INSERT INTO public.melhorias (
  nome, descricao, processo_id, responsavel, status, project_info_id, validacao_etapa
) VALUES 
('Automação de Validação Tarifária', 'Implementar validação automática de fatores de risco no momento da cotação', 'SUB-DEM', 'Coordenador de TI - Rafael Mendes', 'Em Andamento', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2),
('Dashboard de Monitoramento IBNR', 'Criar dashboard em tempo real para acompanhamento das reservas IBNR', 'REG-DEM', 'Analista de BI - Juliana Campos', 'Planejado', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 1),
('Sistema de Alertas de Limites', 'Implementar alertas automáticos para limites regulatórios', 'INV-DEM', 'Gestor de Riscos - Alberto Nascimento', 'Em Andamento', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2);