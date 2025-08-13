-- Listar todas as políticas existentes na tabela project_info
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'project_info';

-- Remover TODAS as políticas existentes da tabela project_info
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_info' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_info', pol.policyname);
    END LOOP;
END $$;

-- Recriar políticas simplificadas e funcionais
CREATE POLICY "select_projects" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid OR
  EXISTS (
    SELECT 1 FROM public.project_users 
    WHERE project_id = project_info.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "insert_projects" 
ON public.project_info 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_projects" 
ON public.project_info 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "delete_projects" 
ON public.project_info 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());