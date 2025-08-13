-- Criar índices adicionais para otimizar consultas e reduzir warnings
CREATE INDEX IF NOT EXISTS idx_project_info_cliente_nome 
ON public.project_info (cliente, nome_projeto) 
WHERE cliente IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_details_user_project 
ON public.project_details (user_id, project_info_id);

-- Otimizar as políticas RLS mais problemáticas para reduzir full table scans
DROP POLICY IF EXISTS "Users can view their own project details" ON public.project_details;
CREATE POLICY "Users can view their own project details" 
ON public.project_details 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid()
  )
);

-- Otimizar política de project_info para permitir acesso via project_users
DROP POLICY IF EXISTS "Users can view projects they created" ON public.project_info;
CREATE POLICY "Users can view projects they have access to" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid()
  )
);

-- Limpar registros órfãos que podem estar causando warnings
DELETE FROM public.project_details 
WHERE project_info_id NOT IN (SELECT id FROM public.project_info);

DELETE FROM public.project_users 
WHERE project_id NOT IN (SELECT id FROM public.project_info);

DELETE FROM public.project_history 
WHERE project_info_id NOT IN (SELECT id FROM public.project_info);

-- Garantir que o projeto IRB(Re) tenha detalhes iniciais
INSERT INTO public.project_details (
  project_info_id, user_id, status_projeto, progresso_percentual,
  processos_mapeados, processos_meta, riscos_identificados, riscos_meta,
  controles_implementados, controles_meta, acoes_melhoria, acoes_melhoria_meta
)
SELECT 
  pi.id, pi.user_id, 'Em Andamento', 75,
  7, 20, 5, 25, 5, 15, 3, 10
FROM public.project_info pi
WHERE pi.cliente ILIKE '%IRB%' 
  AND NOT EXISTS (
    SELECT 1 FROM public.project_details pd 
    WHERE pd.project_info_id = pi.id
  );

-- Atualizar estatísticas para otimização
ANALYZE public.project_info;
ANALYZE public.project_details;
ANALYZE public.project_users;
ANALYZE public.processos;
ANALYZE public.riscos;
ANALYZE public.kris;