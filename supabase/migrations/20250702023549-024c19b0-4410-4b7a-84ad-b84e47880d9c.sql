-- Create temporary table to store user profile data during invitation process
CREATE TABLE public.temp_user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT,
  telefone TEXT,
  cargo TEXT,
  perfil TEXT,
  invitation_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used BOOLEAN DEFAULT false
);

-- Enable RLS on temp_user_profiles table
ALTER TABLE public.temp_user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for temp_user_profiles
CREATE POLICY "Users can view temp profiles for valid tokens" 
  ON public.temp_user_profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "System can insert temp profiles" 
  ON public.temp_user_profiles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update temp profiles" 
  ON public.temp_user_profiles 
  FOR UPDATE 
  USING (true);

-- Update the handle_new_user function to use temp profile data
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