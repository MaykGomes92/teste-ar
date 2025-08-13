-- Update invitation functions to include project context - fix parameter order
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email TEXT,
  p_nome TEXT,
  p_project_id UUID,
  p_telefone TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT NULL,
  p_perfil TEXT DEFAULT NULL,
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

-- Update handle_new_user function to associate users with projects
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  temp_profile RECORD;
BEGIN
  -- Try to find temp profile data based on email
  SELECT * INTO temp_profile 
  FROM public.temp_user_profiles 
  WHERE email = new.email AND used = false
  LIMIT 1;
  
  IF temp_profile.id IS NOT NULL THEN
    -- Insert profile with temp data
    INSERT INTO public.profiles (id, nome, telefone, cargo, perfil)
    VALUES (
      new.id, 
      temp_profile.nome,
      temp_profile.telefone,
      temp_profile.cargo,
      temp_profile.perfil
    );
    
    -- Associate user with project
    IF temp_profile.project_id IS NOT NULL THEN
      INSERT INTO public.project_users (project_id, user_id, role)
      VALUES (
        temp_profile.project_id, 
        new.id, 
        CASE 
          WHEN temp_profile.perfil LIKE 'Orla - Diretor%' THEN 'admin'
          WHEN temp_profile.perfil LIKE 'Orla - Gerência%' THEN 'manager'
          ELSE 'user'
        END
      );
    END IF;
    
    -- Mark temp profile as used
    UPDATE public.temp_user_profiles 
    SET used = true 
    WHERE id = temp_profile.id;
  ELSE
    -- Fallback to metadata if no temp profile found
    INSERT INTO public.profiles (id, nome)
    VALUES (new.id, new.raw_user_meta_data ->> 'nome');
  END IF;
  
  RETURN new;
END;
$$;