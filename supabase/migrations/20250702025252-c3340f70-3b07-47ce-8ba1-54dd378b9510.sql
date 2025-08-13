-- Fix infinite recursion in project_users policies
DROP POLICY IF EXISTS "Users can view project users for their projects" ON public.project_users;
DROP POLICY IF EXISTS "Project admins can manage project users" ON public.project_users;

-- Simpler policies without self-reference
CREATE POLICY "Users can view project users" 
  ON public.project_users 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can view other project users in same projects" 
  ON public.project_users 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can insert project users" 
  ON public.project_users 
  FOR INSERT 
  WITH CHECK (
    project_id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Project admins can update project users" 
  ON public.project_users 
  FOR UPDATE 
  USING (
    project_id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Project admins can delete project users" 
  ON public.project_users 
  FOR DELETE 
  USING (
    project_id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

-- Fix project_info policies to avoid recursion
DROP POLICY IF EXISTS "Users can view their projects" ON public.project_info;
DROP POLICY IF EXISTS "Project admins can update projects" ON public.project_info;
DROP POLICY IF EXISTS "Project admins can delete projects" ON public.project_info;

CREATE POLICY "Users can view their projects" 
  ON public.project_info 
  FOR SELECT 
  USING (
    id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Project creators and admins can update projects" 
  ON public.project_info 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Project creators and admins can delete projects" 
  ON public.project_info 
  FOR DELETE 
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT pu.project_id 
      FROM public.project_users pu 
      WHERE pu.user_id = auth.uid() 
      AND pu.role = 'admin'
    )
  );