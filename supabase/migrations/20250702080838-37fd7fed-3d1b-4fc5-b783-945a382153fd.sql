-- Adicionar dados fictícios adicionais para demonstração
-- Dados de planilhas
INSERT INTO public.dados_planilhas (
  macro_processo, processo_nome, processo_id, nome_planilha, status, criticidade, 
  frequencia_atualizacao, responsavel_manutencao, sistema_origem, tipo_dados, 
  descricao, project_info_id, validacao_etapa, observacoes
) VALUES 
-- Subscrição
('Subscrição', 'Análise de Risco de Subscrição', 'SUB-DEM', 'Matriz Tarifária Automóvel', 'Ativo', 'Alta', 'Mensal', 'Atuário Senior - Carlos Silva', 'Sistema Tarifário', 'Dados Estratégicos', 'Planilha com parâmetros tarifários para produtos automóvel, incluindo fatores de risco, loading comercial e margem técnica', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Atualizada conforme novas análises de mercado'),
('Subscrição', 'Processo de Cotação', 'COT-DEM', 'Base Histórica de Cotações', 'Ativo', 'Média', 'Diária', 'Coordenador Comercial - Ana Santos', 'CRM Vendas', 'Dados Operacionais', 'Histórico completo de cotações realizadas nos últimos 24 meses, incluindo status, valores e conversões', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Integrada automaticamente via API'),

-- Sinistros
('Sinistros', 'Regulação de Sinistros', 'REG-DEM', 'Controle de Reservas IBNR', 'Ativo', 'Alta', 'Semanal', 'Gerente Técnico - Roberto Lima', 'Sistema Sinistros', 'Dados Regulatórios', 'Planilha de controle das reservas constituídas para sinistros ocorridos mas não avisados (IBNR), com metodologia atuarial', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Validada mensalmente pelo Comitê de Riscos'),
('Sinistros', 'Pagamento de Sinistros', 'PAG-DEM', 'Relatório de Sinistros Pagos', 'Ativo', 'Alta', 'Diária', 'Supervisor Financeiro - Marcia Costa', 'Sistema Financeiro', 'Dados Financeiros', 'Relatório detalhado de todos os pagamentos de sinistros realizados, incluindo beneficiários e formas de pagamento', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Conciliado diariamente com sistema contábil'),

-- Investimentos
('Investimentos', 'Gestão de Portfólio', 'INV-DEM', 'Posição Consolidada de Investimentos', 'Ativo', 'Alta', 'Diária', 'Gestor de Investimentos - Fernando Alves', 'Sistema Bloomberg', 'Dados Financeiros', 'Posição detalhada de todos os ativos da carteira de investimentos, incluindo marcação a mercado e duration', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3, 'Marcação a mercado em tempo real'),
('Investimentos', 'Análise de Risco de Crédito', 'CRE-DEM', 'Rating das Contrapartes', 'Ativo', 'Alta', 'Mensal', 'Analista de Risco - Patricia Gomes', 'Sistema Risco', 'Dados de Risco', 'Avaliação de rating interno e externo de todas as contrapartes dos investimentos, incluindo limites de exposição', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2, 'Em processo de automação via API de agências');

-- Testes de controles fictícios
INSERT INTO public.testes (
  nome, descricao, processo_id, data_execucao, executor, revisor, 
  maturidade, mitigacao, procedimento_realizado, project_info_id, validacao_etapa
) VALUES 
('Teste de Validação Tarifária', 'Verificação da aplicação correta dos fatores de risco na precificação de apólices automóvel', 'SUB-DEM', '2024-01-15', 'Auditor Junior - Lucas Ferreira', 'Auditor Senior - Renata Oliveira', 85, 90, 'Análise de amostra de 50 cotações realizadas em janeiro/2024, verificando aplicação de fatores de risco, descontos comerciais e cálculo de IOF. Todas as cotações testadas apresentaram cálculos corretos conforme matriz tarifária vigente.', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3),

('Teste de Constituição de Reservas', 'Validação do cálculo de reservas IBNR conforme metodologia atuarial aprovada', 'REG-DEM', '2024-01-20', 'Atuário Pleno - Marina Santos', 'Atuário Senior - João Pedro', 92, 88, 'Revisão completa da metodologia de cálculo de IBNR para produtos automóvel e residencial. Verificação de parâmetros utilizados, dados históricos e adequação aos padrões regulatórios. Metodologia aprovada pelo Comitê de Riscos.', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3),

('Teste de Limites de Investimento', 'Verificação do cumprimento dos limites regulatórios para investimentos', 'INV-DEM', '2024-01-25', 'Controller - Daniela Rocha', 'Gerente Financeiro - Marcos Vinicius', 78, 85, 'Análise da carteira de investimentos em 31/12/2023, verificando cumprimento de limites por tipo de ativo, rating mínimo, concentração por emissor e duration. Identificadas algumas exposições próximas aos limites que requerem monitoramento contínuo.', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2);

-- Ações de melhoria fictícias
INSERT INTO public.melhorias (
  nome, descricao, processo_id, responsavel, status, project_info_id, validacao_etapa
) VALUES 
('Automação de Validação Tarifária', 'Implementar validação automática de aplicação de fatores de risco no momento da cotação', 'SUB-DEM', 'Coordenador de TI - Rafael Mendes', 'Em Andamento', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2),

('Dashboard de Monitoramento IBNR', 'Criar dashboard em tempo real para acompanhamento da evolução das reservas IBNR', 'REG-DEM', 'Analista de BI - Juliana Campos', 'Planejado', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 1),

('Sistema de Alertas de Limites', 'Implementar sistema de alertas automáticos quando investimentos se aproximarem dos limites regulatórios', 'INV-DEM', 'Gestor de Riscos - Alberto Nascimento', 'Em Andamento', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2),

('Integração com APIs de Rating', 'Automatizar atualização de ratings de contrapartes via integração com agências de rating', 'CRE-DEM', 'Desenvolvedor Senior - Thiago Barbosa', 'Concluído', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 3),

('Workflow de Aprovação de Sinistros', 'Implementar workflow eletrônico para aprovação de sinistros acima de R$ 50.000', 'PAG-DEM', 'Business Analyst - Camila Reis', 'Em Andamento', 'dd1aceb7-8477-4b8c-8cd6-f68de1186417', 2);