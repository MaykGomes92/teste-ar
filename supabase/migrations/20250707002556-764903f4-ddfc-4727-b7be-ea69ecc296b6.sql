-- Fix infinite recursion in RLS policies for project_info
-- First, drop all existing policies to start fresh
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

-- Create simple, non-recursive policies
CREATE POLICY "project_select_policy" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid OR
  EXISTS (
    SELECT 1 FROM public.project_users 
    WHERE project_id = project_info.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "project_insert_policy" 
ON public.project_info 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "project_update_policy" 
ON public.project_info 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "project_delete_policy" 
ON public.project_info 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Ensure IRB template project exists with correct data
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
  'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid,
  (SELECT id FROM public.profiles LIMIT 1),
  'Mapeamento de Processos e Controles Internos - IRB(Re)',
  'IRB Brasil Resseguros S.A.',
  '2024-01-01'::date,
  '2024-12-31'::date,
  'Implementação de framework de controles internos baseado na metodologia COSO para identificação de riscos, mapeamento de processos e estabelecimento de controles efetivos para resseguros',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_info 
  WHERE id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid
);

-- Ensure all users have access to the IRB template project
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

-- Create a demo project for testing
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
  'demo-project-123'::uuid,
  (SELECT id FROM public.profiles LIMIT 1),
  'Sistema de Controles Internos - Empresa Demonstração',
  'Empresa Demonstração Ltda.',
  '2024-01-01'::date,
  '2024-12-31'::date,
  'Projeto demonstrativo para implementação de sistema completo de gestão de controles internos e mapeamento de processos',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_info 
  WHERE id = 'demo-project-123'::uuid
);

-- Give all users access to demo project too
INSERT INTO public.project_users (project_id, user_id, role)
SELECT 
  'demo-project-123'::uuid,
  p.id,
  'user'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = 'demo-project-123'::uuid 
  AND pu.user_id = p.id
);