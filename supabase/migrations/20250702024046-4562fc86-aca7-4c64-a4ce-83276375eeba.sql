-- Fix the function to properly return JSON
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_user_id UUID,
  p_telefone TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT NULL,
  p_perfil TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  nome TEXT,
  telefone TEXT,
  cargo TEXT,
  perfil TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.profiles 
  SET telefone = COALESCE(p_telefone, profiles.telefone),
      cargo = COALESCE(p_cargo, profiles.cargo),
      perfil = COALESCE(p_perfil, profiles.perfil),
      updated_at = now()
  WHERE profiles.id = p_user_id
  RETURNING profiles.id, profiles.nome, profiles.telefone, profiles.cargo, profiles.perfil, profiles.created_at, profiles.updated_at;
END;
$$;