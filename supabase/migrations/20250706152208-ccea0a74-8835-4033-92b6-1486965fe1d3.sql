-- Remover todas as políticas conflitantes da tabela project_info
DROP POLICY IF EXISTS "Users can view own projects and shared projects" ON public.project_info;
DROP POLICY IF EXISTS "All authenticated users can view IRB template project" ON public.project_info;
DROP POLICY IF EXISTS "Users can create own projects" ON public.project_info;
DROP POLICY IF EXISTS "Users can update own projects" ON public.project_info;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.project_info;

-- Recriar políticas simplificadas sem recursão
CREATE POLICY "project_info_select_policy" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid OR
  id IN (
    SELECT project_id FROM public.project_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "project_info_insert_policy" 
ON public.project_info 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "project_info_update_policy" 
ON public.project_info 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "project_info_delete_policy" 
ON public.project_info 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());