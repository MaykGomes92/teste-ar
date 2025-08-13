-- Primeiro, vamos remover TODAS as políticas da tabela project_info para evitar recursão
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_info' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_info', pol.policyname);
    END LOOP;
END $$;

-- Criar políticas completamente novas e simples
CREATE POLICY "allow_select_own_and_shared_projects" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid OR
  id IN (
    SELECT pu.project_id FROM public.project_users pu 
    WHERE pu.user_id = auth.uid()
  )
);

CREATE POLICY "allow_insert_own_projects" 
ON public.project_info 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_update_own_projects" 
ON public.project_info 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "allow_delete_own_projects" 
ON public.project_info 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Criar projeto template adicional para consultores
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
) 
SELECT 
  'template-consultores-001'::uuid,
  (SELECT id FROM public.profiles LIMIT 1),
  'Sistema de Gestão de Controles Internos - Modelo Consultoria',
  'Empresa Exemplo Ltda.',
  '2024-01-01'::date,
  '2024-12-31'::date,
  'Template demonstrativo para implementação de sistema completo de gestão de controles internos, incluindo mapeamento de processos, identificação de riscos e implementação de controles baseados em metodologias internacionais',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_info 
  WHERE id = 'template-consultores-001'::uuid
);

-- Criar detalhes do projeto template
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
  'template-consultores-001'::uuid,
  (SELECT id FROM public.profiles LIMIT 1),
  'Modelo Demonstrativo',
  90,
  15, 18, 12, 15, 18, 20, 8, 10,
  'Modelo completo de sistema de gestão incluindo: mapeamento de processos críticos, matriz de riscos, framework de controles internos, plano de testes e ações de melhoria contínua',
  'Metodologia baseada em COSO e ISO 31000; Equipe técnica especializada; Ferramentas de gestão integradas',
  'Implementação em fases; Recursos limitados; Prazo de 10 meses',
  'Certificação em conformidade; Redução de 40% nos riscos críticos; 100% dos processos documentados; Sistema de monitoramento ativo'
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_details 
  WHERE project_info_id = 'template-consultores-001'::uuid
);

-- Garantir que todos os usuários tenham acesso aos projetos template
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

INSERT INTO public.project_users (project_id, user_id, role)
SELECT 
  'template-consultores-001'::uuid,
  p.id,
  'user'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = 'template-consultores-001'::uuid 
  AND pu.user_id = p.id
);