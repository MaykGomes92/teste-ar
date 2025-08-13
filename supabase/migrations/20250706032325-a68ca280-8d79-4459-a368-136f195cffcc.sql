-- Corrigir recursão infinita nas políticas RLS do project_info
-- Remover políticas duplicadas e conflitantes
DROP POLICY IF EXISTS "Users can view projects they have access to" ON public.project_info;
DROP POLICY IF EXISTS "Users can view projects they created" ON public.project_info;
DROP POLICY IF EXISTS "Criador do projeto pode atualizá-lo" ON public.project_info;
DROP POLICY IF EXISTS "Project creators can delete their projects" ON public.project_info;
DROP POLICY IF EXISTS "Project creators can update their projects" ON public.project_info;
DROP POLICY IF EXISTS "Users can create project info" ON public.project_info;
DROP POLICY IF EXISTS "Users can create projects" ON public.project_info;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir projetos" ON public.project_info;

-- Criar políticas simplificadas e sem recursão
CREATE POLICY "Users can view own projects and shared projects" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = project_info.id 
    AND pu.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own projects" 
ON public.project_info 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" 
ON public.project_info 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" 
ON public.project_info 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Corrigir também políticas do project_details para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own project details" ON public.project_details;

CREATE POLICY "Users can view project details" 
ON public.project_details 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = project_details.project_info_id 
    AND pu.user_id = auth.uid()
  )
);

-- Garantir que o projeto IRB existe e tem todos os dados necessários
DO $$
DECLARE
    irb_project_id UUID := 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid;
    first_user_id UUID;
BEGIN
    -- Buscar o primeiro usuário
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não encontrar, usar qualquer usuário da tabela profiles
    IF first_user_id IS NULL THEN
        SELECT id INTO first_user_id 
        FROM public.profiles 
        LIMIT 1;
    END IF;
    
    -- Garantir que o projeto IRB existe
    INSERT INTO public.project_info (
        id, user_id, nome_projeto, cliente, data_inicio, data_fim, objetivo_projeto
    ) VALUES (
        irb_project_id,
        first_user_id,
        'Mapeamento de Processos e Controles Internos - IRB(Re)',
        'IRB Brasil Resseguros S.A.',
        '2024-01-01',
        '2024-12-31',
        'Implementação de framework de controles internos baseado na metodologia COSO para identificação de riscos, mapeamento de processos e estabelecimento de controles efetivos para resseguros'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Garantir associação do usuário ao projeto
    INSERT INTO public.project_users (project_id, user_id, role) 
    VALUES (irb_project_id, first_user_id, 'admin')
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    -- Executar função para popular dados se não existirem
    IF NOT EXISTS (SELECT 1 FROM public.riscos WHERE project_info_id = irb_project_id LIMIT 1) THEN
        PERFORM public.populate_irb_template_data();
    END IF;
END
$$;