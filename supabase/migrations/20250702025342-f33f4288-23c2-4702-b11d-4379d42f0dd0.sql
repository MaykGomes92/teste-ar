-- Create a test project for validation
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
  'Projeto Teste - Validação Sistema',
  'Empresa Teste Ltda',
  '2024-01-01',
  '2024-12-31',
  NULL,
  'Projeto criado automaticamente para validação das funcionalidades do sistema de gestão de projetos e controles internos.'
) ON CONFLICT DO NOTHING;

-- Get the project ID for the test project and insert project details
WITH test_project AS (
  SELECT id FROM public.project_info 
  WHERE nome_projeto = 'Projeto Teste - Validação Sistema'
  AND user_id = 'f402f622-09e7-4e45-be87-814ecf999017'
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
  acoes_melhoria_meta
) 
SELECT 
  tp.id,
  'f402f622-09e7-4e45-be87-814ecf999017',
  'Em Andamento',
  25,
  15,
  60,
  35,
  150,
  28,
  120,
  8,
  30
FROM test_project tp
ON CONFLICT (project_info_id, user_id) DO NOTHING;