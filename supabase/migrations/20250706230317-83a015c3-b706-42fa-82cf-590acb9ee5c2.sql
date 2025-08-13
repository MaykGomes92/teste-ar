-- Garantir que o projeto IRB(Re) tenha todos os dados necessários
UPDATE public.project_info 
SET 
  cliente = 'IRB Brasil Resseguros S.A.',
  nome_projeto = 'Mapeamento de Processos e Controles Internos - IRB(Re)',
  objetivo_projeto = 'Implementação de framework de controles internos baseado na metodologia COSO para identificação de riscos, mapeamento de processos e estabelecimento de controles efetivos para resseguros',
  updated_at = now()
WHERE id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid;

-- Garantir que todos os usuários tenham acesso ao projeto IRB
INSERT INTO public.project_users (project_id, user_id, role)
SELECT 
  'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid,
  p.id,
  'user'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid 
  AND pu.user_id = p.id
);

-- Popular dados iniciais se não existirem
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
  'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid,
  (SELECT id FROM public.profiles LIMIT 1),
  'Em Andamento', 
  75,
  7, 20, 7, 25, 7, 15, 5, 10,
  'Mapeamento completo dos processos críticos de negócio, identificação e avaliação de riscos operacionais, implementação de controles internos e testes de efetividade',
  'Disponibilidade de equipe técnica; Acesso às informações dos processos; Comprometimento da alta direção',
  'Orçamento limitado; Prazo de 12 meses; Recursos humanos disponíveis',
  'Redução de 30% nos riscos críticos; 100% dos processos mapeados; Controles implementados e testados'
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_details 
  WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid
);

-- Chamar função para popular dados complementares
SELECT public.initialize_irb_template_project();