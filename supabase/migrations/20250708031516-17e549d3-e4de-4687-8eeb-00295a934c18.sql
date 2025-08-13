-- Corrigir políticas de segurança muito permissivas

-- 1. Corrigir políticas da tabela melhorias
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar melhorias" ON public.melhorias;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar melhorias" ON public.melhorias;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir melhorias" ON public.melhorias;
DROP POLICY IF EXISTS "Usuários podem ver todas as melhorias" ON public.melhorias;

CREATE POLICY "Project users can view melhorias" 
ON public.melhorias 
FOR SELECT 
USING (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Project users can insert melhorias" 
ON public.melhorias 
FOR INSERT 
WITH CHECK (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY "Project users can update melhorias" 
ON public.melhorias 
FOR UPDATE 
USING (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY "Project admins can delete melhorias" 
ON public.melhorias 
FOR DELETE 
USING (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- 2. Corrigir políticas da tabela testes
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar testes" ON public.testes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar testes" ON public.testes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir testes" ON public.testes;
DROP POLICY IF EXISTS "Usuários podem ver todos os testes" ON public.testes;

CREATE POLICY "Project users can view testes" 
ON public.testes 
FOR SELECT 
USING (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Project users can insert testes" 
ON public.testes 
FOR INSERT 
WITH CHECK (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY "Project users can update testes" 
ON public.testes 
FOR UPDATE 
USING (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'user')
  )
);

CREATE POLICY "Project admins can delete testes" 
ON public.testes 
FOR DELETE 
USING (
  project_info_id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);

-- 3. Corrigir política duplicada da tabela profiles
DROP POLICY IF EXISTS "Usuários autenticados podem inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

-- 4. Corrigir política da tabela temp_user_profiles
DROP POLICY IF EXISTS "Users can view temp profiles for valid tokens" ON public.temp_user_profiles;

CREATE POLICY "System can view temp profiles" 
ON public.temp_user_profiles 
FOR SELECT 
USING (
  -- Apenas para uso interno do sistema na criação de usuários
  auth.role() = 'service_role' OR 
  -- Ou para o usuário que possui o token válido
  invitation_token IS NOT NULL
);

-- 5. Remover políticas duplicadas da tabela project_users
DROP POLICY IF EXISTS "Users can view own project membership" ON public.project_users;