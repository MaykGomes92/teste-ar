-- Grant necessary permissions for temp_user_profiles
GRANT ALL ON public.temp_user_profiles TO authenticated;
GRANT ALL ON public.temp_user_profiles TO service_role;

-- Create a function to manually create user invitations with profile data
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email TEXT,
  p_nome TEXT,
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
  -- Generate token
  v_token := gen_random_uuid()::TEXT;
  
  -- Insert invitation
  INSERT INTO public.user_invitations (email, token, created_by)
  VALUES (p_email, v_token, COALESCE(p_created_by, auth.uid()))
  RETURNING id INTO v_invitation_id;
  
  -- Insert temp profile
  INSERT INTO public.temp_user_profiles (email, nome, telefone, cargo, perfil, invitation_token)
  VALUES (p_email, p_nome, p_telefone, p_cargo, p_perfil, v_token);
  
  v_result := json_build_object(
    'invitation_id', v_invitation_id,
    'token', v_token,
    'email', p_email,
    'nome', p_nome
  );
  
  RETURN v_result;
END;
$$;