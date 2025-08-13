-- Create function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id UUID,
  p_telefone TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT NULL,
  p_perfil TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE public.profiles 
  SET telefone = COALESCE(p_telefone, telefone),
      cargo = COALESCE(p_cargo, cargo),
      perfil = COALESCE(p_perfil, perfil),
      updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Update Guilherme Carvalho's profile
SELECT public.update_user_profile(
  'f402f622-09e7-4e45-be87-814ecf999017',
  '21 994440823',
  'Sócio-Diretor',
  'Orla - Diretor'
);