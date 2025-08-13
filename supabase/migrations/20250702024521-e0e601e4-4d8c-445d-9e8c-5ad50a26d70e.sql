-- Continue updating RLS policies for remaining tables

-- MELHORIAS
DROP POLICY IF EXISTS "Usuários podem ver todas as melhorias" ON public.melhorias;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir melhorias" ON public.melhorias;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar melhorias" ON public.melhorias;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar melhorias" ON public.melhorias;

CREATE POLICY "Users can view improvements in their projects" 
  ON public.melhorias 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = melhorias.project_info_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Project users can manage improvements" 
  ON public.melhorias 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = melhorias.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );

-- TESTES
DROP POLICY IF EXISTS "Usuários podem ver todos os testes" ON public.testes;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir testes" ON public.testes;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar testes" ON public.testes;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar testes" ON public.testes;

CREATE POLICY "Users can view tests in their projects" 
  ON public.testes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = testes.project_info_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Project users can manage tests" 
  ON public.testes 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = testes.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );

-- PROJECT_DETAILS
DROP POLICY IF EXISTS "Users can view their own project details" ON public.project_details;
DROP POLICY IF EXISTS "Users can update their own project details" ON public.project_details;
DROP POLICY IF EXISTS "Users can create their own project details" ON public.project_details;
DROP POLICY IF EXISTS "Users can delete their own project details" ON public.project_details;

CREATE POLICY "Users can view project details for their projects" 
  ON public.project_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = project_details.project_info_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can manage project details" 
  ON public.project_details 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = project_details.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

-- Update invitation functions to include project context
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email TEXT,
  p_nome TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT NULL,
  p_perfil TEXT DEFAULT NULL,
  p_project_id UUID,
  p_created_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_invitation_id UUID;
  v_result JSON;
BEGIN
  -- Verify user has permission to invite to this project
  IF NOT EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = p_project_id 
    AND pu.user_id = COALESCE(p_created_by, auth.uid()) 
    AND pu.role IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Você não tem permissão para convidar usuários para este projeto';
  END IF;
  
  -- Generate token
  v_token := gen_random_uuid()::TEXT;
  
  -- Insert invitation
  INSERT INTO public.user_invitations (email, token, created_by, project_id)
  VALUES (p_email, v_token, COALESCE(p_created_by, auth.uid()), p_project_id)
  RETURNING id INTO v_invitation_id;
  
  -- Insert temp profile
  INSERT INTO public.temp_user_profiles (email, nome, telefone, cargo, perfil, invitation_token, project_id)
  VALUES (p_email, p_nome, p_telefone, p_cargo, p_perfil, v_token, p_project_id);
  
  v_result := json_build_object(
    'invitation_id', v_invitation_id,
    'token', v_token,
    'email', p_email,
    'nome', p_nome,
    'project_id', p_project_id
  );
  
  RETURN v_result;
END;
$$;