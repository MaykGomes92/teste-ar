-- Drop all existing project_users policies
DROP POLICY IF EXISTS "Users can view project users" ON public.project_users;
DROP POLICY IF EXISTS "Users can view other project users in same projects" ON public.project_users;
DROP POLICY IF EXISTS "Project admins can insert project users" ON public.project_users;
DROP POLICY IF EXISTS "Project admins can update project users" ON public.project_users;
DROP POLICY IF EXISTS "Project admins can delete project users" ON public.project_users;
DROP POLICY IF EXISTS "Users can view project users for their projects" ON public.project_users;
DROP POLICY IF EXISTS "Project admins can manage project users" ON public.project_users;

-- Drop all existing project_info policies  
DROP POLICY IF EXISTS "Users can view their projects" ON public.project_info;
DROP POLICY IF EXISTS "Project creators and admins can update projects" ON public.project_info;
DROP POLICY IF EXISTS "Project creators and admins can delete projects" ON public.project_info;
DROP POLICY IF EXISTS "Project admins can update projects" ON public.project_info;
DROP POLICY IF EXISTS "Project admins can delete projects" ON public.project_info;

-- Create new project_users policies without recursion
CREATE POLICY "Users can view own membership" 
  ON public.project_users 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Project creators can manage all project users" 
  ON public.project_users 
  FOR ALL 
  USING (
    project_id IN (
      SELECT pi.id 
      FROM public.project_info pi 
      WHERE pi.user_id = auth.uid()
    )
  );

-- Create new project_info policies
CREATE POLICY "Users can view projects they created" 
  ON public.project_info 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Project creators can update their projects" 
  ON public.project_info 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Project creators can delete their projects" 
  ON public.project_info 
  FOR DELETE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create projects" 
  ON public.project_info 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());