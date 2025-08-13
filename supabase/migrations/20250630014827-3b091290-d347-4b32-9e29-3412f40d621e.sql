
-- Atualizar política para permitir que usuários com perfil "Orla - Diretor" vejam todos os projetos
DROP POLICY IF EXISTS "Users can view their own project info" ON public.project_info;

CREATE POLICY "Users can view projects based on profile" 
  ON public.project_info 
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );

-- Atualizar política de inserção para manter a mesma lógica
DROP POLICY IF EXISTS "Users can create their own project info" ON public.project_info;

CREATE POLICY "Users can create project info" 
  ON public.project_info 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Atualizar política de atualização
DROP POLICY IF EXISTS "Users can update their own project info" ON public.project_info;

CREATE POLICY "Users can update projects based on profile" 
  ON public.project_info 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );

-- Atualizar política de exclusão
DROP POLICY IF EXISTS "Users can delete their own project info" ON public.project_info;

CREATE POLICY "Users can delete projects based on profile" 
  ON public.project_info 
  FOR DELETE 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.perfil = 'Orla - Diretor'
    )
  );
