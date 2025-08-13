-- Create a test project for validation
INSERT INTO public.project_info (
  user_id,
  nome_projeto,
  cliente,
  data_inicio,
  data_fim,
  sponsor_principal,
  objetivo_projeto
) 
SELECT 
  'f402f622-09e7-4e45-be87-814ecf999017',
  'Projeto Teste - Validação Sistema',
  'Empresa Teste Ltda',
  '2024-01-01',
  '2024-12-31',
  NULL,
  'Projeto criado automaticamente para validação das funcionalidades do sistema de gestão de projetos e controles internos.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_info 
  WHERE nome_projeto = 'Projeto Teste - Validação Sistema'
  AND user_id = 'f402f622-09e7-4e45-be87-814ecf999017'
);

-- Insert project details for the test project
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
  pi.id,
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
FROM public.project_info pi
WHERE pi.nome_projeto = 'Projeto Teste - Validação Sistema'
AND pi.user_id = 'f402f622-09e7-4e45-be87-814ecf999017'
AND NOT EXISTS (
  SELECT 1 FROM public.project_details pd 
  WHERE pd.project_info_id = pi.id 
  AND pd.user_id = 'f402f622-09e7-4e45-be87-814ecf999017'
);