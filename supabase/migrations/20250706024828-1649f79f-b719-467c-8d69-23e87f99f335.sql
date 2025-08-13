-- Corrigir políticas RLS que podem causar recursão infinita
-- Criar função security definer para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT profiles.perfil 
  FROM public.profiles 
  WHERE profiles.id = auth.uid();
$$;

-- Verificar e corrigir constraints de foreign keys
-- Remover constraints problemáticas temporariamente e recriar adequadamente
DO $$
BEGIN
    -- Verificar se constraint existe antes de tentar removê-la
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_riscos_processo' 
               AND table_name = 'riscos') THEN
        ALTER TABLE public.riscos DROP CONSTRAINT fk_riscos_processo;
    END IF;
    
    -- Recriar constraint de forma mais segura
    ALTER TABLE public.riscos 
    ADD CONSTRAINT fk_riscos_processo 
    FOREIGN KEY (processo_id) 
    REFERENCES public.processos(id) 
    ON DELETE SET NULL;
    
    -- Verificar constraint de kris
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_kris_processo' 
               AND table_name = 'kris') THEN
        ALTER TABLE public.kris DROP CONSTRAINT fk_kris_processo;
    END IF;
    
    ALTER TABLE public.kris 
    ADD CONSTRAINT fk_kris_processo 
    FOREIGN KEY (processo_id) 
    REFERENCES public.processos(id) 
    ON DELETE SET NULL;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Se houver erro, apenas log e continue
        RAISE NOTICE 'Erro ao corrigir constraints: %', SQLERRM;
END $$;

-- Corrigir função de atualização de timestamps que pode estar causando warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Aplicar triggers de updated_at onde necessário (sem duplicatas)
DO $$
BEGIN
    -- Trigger para project_info
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_info_updated_at') THEN
        CREATE TRIGGER update_project_info_updated_at
            BEFORE UPDATE ON public.project_info
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Trigger para project_details
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_details_updated_at') THEN
        CREATE TRIGGER update_project_details_updated_at
            BEFORE UPDATE ON public.project_details
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Trigger para profiles
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Corrigir políticas RLS problemáticas que podem causar recursão
DROP POLICY IF EXISTS "Users can view profiles in their projects" ON public.profiles;

-- Recriar política de forma mais segura
CREATE POLICY "Users can view profiles in their projects" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
    id = auth.uid() 
    OR 
    EXISTS (
        SELECT 1 FROM public.project_users pu1, public.project_users pu2
        WHERE pu1.user_id = auth.uid() 
        AND pu2.user_id = profiles.id 
        AND pu1.project_id = pu2.project_id
    )
);

-- Otimizar função handle_new_user para evitar warnings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  temp_profile RECORD;
BEGIN
  -- Try to find temp profile data based on email
  SELECT * INTO temp_profile 
  FROM public.temp_user_profiles 
  WHERE email = NEW.email AND used = false
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Insert profile with temp data or fallback
  IF temp_profile.id IS NOT NULL THEN
    INSERT INTO public.profiles (id, nome, telefone, cargo, perfil)
    VALUES (
      NEW.id, 
      temp_profile.nome,
      temp_profile.telefone,
      temp_profile.cargo,
      temp_profile.perfil
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Associate user with project if specified
    IF temp_profile.project_id IS NOT NULL THEN
      INSERT INTO public.project_users (project_id, user_id, role)
      VALUES (
        temp_profile.project_id, 
        NEW.id, 
        CASE 
          WHEN temp_profile.perfil LIKE 'Orla - Diretor%' THEN 'admin'
          WHEN temp_profile.perfil LIKE 'Orla - Gerência%' THEN 'manager'
          ELSE 'user'
        END
      )
      ON CONFLICT (project_id, user_id) DO NOTHING;
    END IF;
    
    -- Mark temp profile as used
    UPDATE public.temp_user_profiles 
    SET used = true 
    WHERE id = temp_profile.id;
  ELSE
    -- Fallback to metadata if no temp profile found
    INSERT INTO public.profiles (id, nome)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email))
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;