-- Create security definer function to check project access without recursion
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- User owns the project
    SELECT 1 FROM public.project_info pi 
    WHERE pi.id = project_uuid AND pi.user_id = auth.uid()
  ) OR 
  -- IRB template project (everyone can access)
  project_uuid = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid OR
  -- User is assigned to project
  EXISTS (
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = project_uuid AND pu.user_id = auth.uid()
  );
$$;

-- Drop all existing policies on project_info
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

-- Create new simple policies using the security definer function
CREATE POLICY "users_can_select_accessible_projects" 
ON public.project_info 
FOR SELECT 
TO authenticated
USING (public.user_can_access_project(id));

CREATE POLICY "users_can_insert_own_projects" 
ON public.project_info 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_projects" 
ON public.project_info 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_can_delete_own_projects" 
ON public.project_info 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());