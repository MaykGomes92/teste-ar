-- Criar projeto template IRB(Re) em produção
INSERT INTO public.project_info (
  id,
  user_id,
  nome_projeto,
  cliente,
  data_inicio,
  data_fim,
  objetivo_projeto,
  created_at,
  updated_at
) VALUES (
  'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid, -- User padrão do sistema
  'Mapeamento de Processos e Controles Internos',
  'IRB(Re)',
  '2024-01-01',
  '2024-12-31',
  'Implementação de framework de controles internos baseado na metodologia COSO para identificação de riscos, mapeamento de processos e estabelecimento de controles efetivos',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  nome_projeto = EXCLUDED.nome_projeto,
  cliente = EXCLUDED.cliente,
  objetivo_projeto = EXCLUDED.objetivo_projeto,
  updated_at = now();

-- Criar detalhes do projeto
INSERT INTO public.project_details (
  project_info_id,
  user_id,
  status_projeto,
  progresso_percentual,
  processos_mapeados,
  processos_meta,
  riscos_identificados,
  riscos_meta,
  controles_implementados,
  controles_meta,
  acoes_melhoria,
  acoes_melhoria_meta,
  escopo,
  premissas,
  restricoes,
  criterios_sucesso
) VALUES (
  'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Em Andamento',
  75,
  45,
  60,
  120,
  150,
  95,
  120,
  25,
  30,
  'Mapeamento completo dos processos críticos de negócio, identificação e avaliação de riscos operacionais, implementação de controles internos e testes de efetividade',
  'Disponibilidade de equipe técnica; Acesso às informações dos processos; Comprometimento da alta direção',
  'Orçamento limitado; Prazo de 12 meses; Recursos humanos disponíveis',
  'Redução de 30% nos riscos críticos; 100% dos processos mapeados; Controles implementados e testados'
) ON CONFLICT (project_info_id, user_id) DO UPDATE SET
  status_projeto = EXCLUDED.status_projeto,
  progresso_percentual = EXCLUDED.progresso_percentual,
  processos_mapeados = EXCLUDED.processos_mapeados,
  riscos_identificados = EXCLUDED.riscos_identificados,
  controles_implementados = EXCLUDED.controles_implementados,
  acoes_melhoria = EXCLUDED.acoes_melhoria,
  updated_at = now();

-- Criar estruturas da cadeia de valor
INSERT INTO public.estruturas_cadeia_valor (id, nome, descricao, cor, ordem, project_info_id) VALUES
('struct-01', 'Atividades Primárias', 'Processos que agregam valor diretamente ao cliente', '#3B82F6', 1, 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
('struct-02', 'Atividades de Apoio', 'Processos que suportam as atividades primárias', '#10B981', 2, 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  updated_at = now();

-- Criar macro processos
INSERT INTO public.macro_processos (id, nome, descricao, estrutura_id, project_info_id) VALUES
('MP-001', 'Subscrição', 'Processos relacionados à análise e aceitação de riscos', 'struct-01', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
('MP-002', 'Sinistros', 'Processos de regulação e pagamento de sinistros', 'struct-01', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
('MP-003', 'Resseguro', 'Processos de cessão e retrocessão de riscos', 'struct-01', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
('MP-004', 'Gestão Financeira', 'Processos financeiros e contábeis', 'struct-02', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
('MP-005', 'Gestão de Riscos', 'Processos de identificação e controle de riscos', 'struct-02', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
('MP-006', 'Tecnologia da Informação', 'Processos de TI e segurança da informação', 'struct-02', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  updated_at = now();

-- Criar processos detalhados
INSERT INTO public.processos (id, nome, descricao, macro_processo, macro_processo_id, status, project_info_id, validacao_etapa) VALUES
('P-001-001', 'Análise de Propostas', 'Análise técnica e comercial de propostas de seguro', 'Subscrição', 'MP-001', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 3),
('P-001-002', 'Precificação', 'Cálculo de prêmios e definição de condições', 'Subscrição', 'MP-001', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 3),
('P-002-001', 'Abertura de Sinistros', 'Registro e classificação inicial de sinistros', 'Sinistros', 'MP-002', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 2),
('P-002-002', 'Regulação', 'Investigação e avaliação de sinistros', 'Sinistros', 'MP-002', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 2),
('P-003-001', 'Cessão Automática', 'Processo de cessão automática de riscos', 'Resseguro', 'MP-003', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 1),
('P-004-001', 'Faturamento', 'Emissão e cobrança de faturas', 'Gestão Financeira', 'MP-004', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 3),
('P-005-001', 'Monitoramento de Riscos', 'Identificação e monitoramento contínuo de riscos', 'Gestão de Riscos', 'MP-005', 'Ativo', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 2)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  status = EXCLUDED.status,
  updated_at = now();

-- Criar riscos identificados
INSERT INTO public.riscos (nome, categoria, nivel_impacto, probabilidade, processo_id, project_info_id, status, codigo, causas, consequencias, area) VALUES
('Falha na Análise de Risco', 'Operacional', 'Alto', 'Média', 'P-001-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Identificado', 'R-001', 'Falta de expertise técnica, pressão comercial', 'Subscrição inadequada, prejuízos financeiros', 'Subscrição'),
('Fraude em Sinistros', 'Operacional', 'Alto', 'Média', 'P-002-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Identificado', 'R-002', 'Controles inadequados, falta de investigação', 'Pagamentos indevidos, perdas financeiras', 'Sinistros'),
('Falha em Sistemas de TI', 'Tecnológico', 'Alto', 'Baixa', 'P-004-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Identificado', 'R-003', 'Obsolescência tecnológica, falta de manutenção', 'Interrupção de operações, perda de dados', 'TI'),
('Concentração de Riscos', 'Estratégico', 'Médio', 'Média', 'P-003-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Identificado', 'R-004', 'Falta de diversificação, limites inadequados', 'Exposição excessiva, volatilidade de resultados', 'Resseguro'),
('Inadimplência', 'Crédito', 'Médio', 'Média', 'P-004-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Identificado', 'R-005', 'Análise de crédito inadequada, crise econômica', 'Redução de fluxo de caixa, provisões', 'Financeiro');

-- Criar controles/KRIs
INSERT INTO public.kris (nome, categoria, descricao, frequencia_medicao, tipo_medicao, processo_id, project_info_id, status, codigo, responsavel, validacao_etapa) VALUES
('Comitê de Subscrição', 'Operacional', 'Aprovação colegiada para riscos acima de limites estabelecidos', 'Mensal', 'Qualitativo', 'P-001-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'C-001', 'Gerente de Subscrição', 2),
('Sistema de Detecção de Fraudes', 'Tecnológico', 'Análise automatizada de padrões suspeitos em sinistros', 'Diário', 'Quantitativo', 'P-002-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'C-002', 'Analista de Sinistros', 3),
('Backup e Recuperação', 'Tecnológico', 'Rotinas automáticas de backup e testes de recuperação', 'Diário', 'Quantitativo', 'P-004-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'C-003', 'Coordenador de TI', 2),
('Limites de Retenção', 'Operacional', 'Definição e monitoramento de limites por tipo de risco', 'Mensal', 'Quantitativo', 'P-003-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'C-004', 'Gerente de Resseguro', 1),
('Análise de Crédito', 'Financeiro', 'Avaliação da capacidade de pagamento dos segurados', 'Mensal', 'Qualitativo', 'P-004-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'C-005', 'Analista Financeiro', 2);

-- Criar ações de melhoria
INSERT INTO public.melhorias (nome, descricao, status, responsavel, project_info_id, validacao_etapa) VALUES
('Implementar IA na Análise de Riscos', 'Desenvolvimento de sistema de inteligência artificial para apoio à análise de propostas', 'Planejado', 'Diretor de TI', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 1),
('Certificação ISO 27001', 'Obtenção de certificação de segurança da informação', 'Em Desenvolvimento', 'CISO', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 2),
('Dashboard Executivo', 'Criação de painel executivo com métricas em tempo real', 'Implementado', 'Gerente de BI', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 3);

-- Criar dados de planilhas
INSERT INTO public.dados_planilhas (nome_planilha, descricao, macro_processo, processo_nome, processo_id, project_info_id, status, criticidade, responsavel_manutencao, frequencia_atualizacao, validacao_etapa) VALUES
('Relatório de Prêmios', 'Controle mensal de prêmios emitidos por produto', 'Subscrição', 'Análise de Propostas', 'P-001-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'Alta', 'Analista de Subscrição', 'Mensal', 2),
('Controle de Sinistros IBNR', 'Estimativa de sinistros ocorridos mas não reportados', 'Sinistros', 'Regulação', 'P-002-002', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'Crítica', 'Atuário Sênior', 'Mensal', 3),
('Posição de Resseguro', 'Controle de cessões e recuperações de resseguro', 'Resseguro', 'Cessão Automática', 'P-003-001', 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, 'Ativo', 'Alta', 'Analista de Resseguro', 'Diário', 2);

-- Associar usuário padrão ao projeto (será substituído pelo primeiro usuário que se registrar)
INSERT INTO public.project_users (project_id, user_id, role) VALUES
('bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, 'admin')
ON CONFLICT (project_id, user_id) DO NOTHING;