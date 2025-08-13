-- Criar projeto de demonstração baseado no template IRB(Re)
-- Inserir novo projeto de demonstração
INSERT INTO public.project_info (
  user_id,
  nome_projeto,
  cliente,
  data_inicio,
  data_fim,
  sponsor_principal,
  objetivo_projeto
) VALUES (
  'f402f622-09e7-4e45-be87-814ecf999017',
  'Controles Internos e Gestão de Riscos - Demonstração',
  'TechCorp Seguros S.A.',
  '2024-01-15',
  '2024-08-30',
  NULL,
  'Projeto de demonstração para implementação de framework de controles internos, identificação e mitigação de riscos operacionais, adequação a Solvência II e melhoria da governança corporativa. Inclui mapeamento de processos críticos, matriz de riscos abrangente e implementação de KRIs para monitoramento contínuo.'
);

-- Obter o ID do projeto recém-criado e inserir detalhes
WITH demo_project AS (
  SELECT id, user_id FROM public.project_info 
  WHERE cliente = 'TechCorp Seguros S.A.' 
  AND nome_projeto = 'Controles Internos e Gestão de Riscos - Demonstração'
  LIMIT 1
)
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
) 
SELECT 
  dp.id,
  dp.user_id,
  'Em Andamento',
  65,
  42,
  65,
  89,
  135,
  76,
  110,
  18,
  25,
  'Implementação completa de framework de controles internos cobrindo: (1) Processos operacionais críticos - Subscrição, Sinistros, Resseguros, Investimentos, Contabilidade; (2) Gestão de riscos - Identificação, avaliação, mitigação e monitoramento; (3) Compliance regulatório - Solvência II, LGPD, normas SUSEP; (4) Governança corporativa - Comitês, políticas, procedimentos.',
  'Apoio integral da alta administração e disponibilidade de equipes técnicas. Acesso a sistemas e dados necessários. Cronograma aprovado pelo Conselho de Administração. Recursos orçamentários confirmados para implementação.',
  'Limitações de integração com sistemas legados específicos. Dependência de aprovações regulatórias para certas mudanças. Necessidade de treinamento extensivo das equipes. Prazo máximo de 8 meses para conclusão.',
  'Redução de 40% nos riscos operacionais críticos. Implementação de 110+ controles automatizados. Aprovação em auditoria regulatória. Tempo médio de resposta a incidentes < 4 horas. ROI positivo em 18 meses.'
FROM demo_project dp;

-- Associar usuário ao projeto como admin
WITH demo_project AS (
  SELECT id, user_id FROM public.project_info 
  WHERE cliente = 'TechCorp Seguros S.A.' 
  AND nome_projeto = 'Controles Internos e Gestão de Riscos - Demonstração'
  LIMIT 1
)
INSERT INTO public.project_users (project_id, user_id, role)
SELECT dp.id, dp.user_id, 'admin'
FROM demo_project dp;

-- Registrar criação no histórico
WITH demo_project AS (
  SELECT id, user_id FROM public.project_info 
  WHERE cliente = 'TechCorp Seguros S.A.' 
  AND nome_projeto = 'Controles Internos e Gestão de Riscos - Demonstração'
  LIMIT 1
)
INSERT INTO public.project_history (
  project_info_id,
  user_id,
  tipo_mudanca,
  descricao_mudanca,
  dados_novos
)
SELECT 
  dp.id,
  dp.user_id,
  'criacao_demo',
  'Projeto de demonstração criado com dados fictícios para apresentação ao cliente',
  jsonb_build_object('cliente', 'TechCorp Seguros S.A.', 'tipo', 'demonstracao')
FROM demo_project dp;