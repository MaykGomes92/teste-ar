-- Garantir que todos os usuários autenticados tenham acesso ao projeto IRB(Re) template
-- Primeiro, vamos verificar e criar uma política específica para o projeto template
CREATE POLICY "All authenticated users can view IRB template project" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  cliente ILIKE '%IRB%' AND id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid
);

-- Garantir que todos os usuários autenticados vejam os detalhes do projeto template
CREATE POLICY "All authenticated users can view IRB template details" 
ON public.project_details 
FOR SELECT 
TO authenticated
USING (
  project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid
);

-- Associar todos os usuários existentes ao projeto IRB como visualizadores
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

-- Atualizar as métricas do projeto IRB(Re) para refletir os dados reais
UPDATE public.project_details 
SET 
  processos_mapeados = (SELECT COUNT(*) FROM public.processos WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
  riscos_identificados = (SELECT COUNT(*) FROM public.riscos WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
  controles_implementados = (SELECT COUNT(*) FROM public.kris WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
  acoes_melhoria = (SELECT COUNT(*) FROM public.melhorias WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid),
  progresso_percentual = 75,
  status_projeto = 'Em Andamento',
  updated_at = CURRENT_TIMESTAMP
WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid;