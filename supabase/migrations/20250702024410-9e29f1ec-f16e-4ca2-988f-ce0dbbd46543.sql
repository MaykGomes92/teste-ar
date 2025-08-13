-- First, let's clean up users except Tech
-- Remove profiles that don't belong to Tech user
DELETE FROM public.profiles 
WHERE id NOT IN ('f402f622-09e7-4e45-be87-814ecf999017');

-- Remove user invitations that are not for tech
DELETE FROM public.user_invitations 
WHERE email != 'tech@orlaconsultoria.com.br';

-- Remove temp profiles that are not for tech
DELETE FROM public.temp_user_profiles 
WHERE email != 'tech@orlaconsultoria.com.br';

-- Now let's implement project-based architecture
-- Create project_users table to associate users with projects
CREATE TABLE public.project_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.project_info(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'manager', 'user', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on project_users
ALTER TABLE public.project_users ENABLE ROW LEVEL SECURITY;

-- Add project_id to temp_user_profiles and user_invitations
ALTER TABLE public.temp_user_profiles ADD COLUMN project_id UUID REFERENCES public.project_info(id);
ALTER TABLE public.user_invitations ADD COLUMN project_id UUID REFERENCES public.project_info(id);

-- Create policies for project_users
CREATE POLICY "Users can view project users for their projects" 
  ON public.project_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu2 
      WHERE pu2.project_id = project_users.project_id 
      AND pu2.user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can manage project users" 
  ON public.project_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu2 
      WHERE pu2.project_id = project_users.project_id 
      AND pu2.user_id = auth.uid() 
      AND pu2.role IN ('admin', 'manager')
    )
  );

-- Update RLS policies for all main tables to include project isolation
-- Profiles can be viewed by users in same projects
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

CREATE POLICY "Users can view profiles in their projects" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.project_users pu1, public.project_users pu2
      WHERE pu1.user_id = auth.uid() 
      AND pu2.user_id = profiles.id
      AND pu1.project_id = pu2.project_id
    )
  );

-- Update project_info policies to use project_users
DROP POLICY IF EXISTS "Users can view projects based on profile" ON public.project_info;
DROP POLICY IF EXISTS "Users can update projects based on profile" ON public.project_info;
DROP POLICY IF EXISTS "Users can delete projects based on profile" ON public.project_info;
DROP POLICY IF EXISTS "Usuários podem ver informações do projeto" ON public.project_info;

CREATE POLICY "Users can view their projects" 
  ON public.project_info 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = project_info.id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can update projects" 
  ON public.project_info 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = project_info.id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Project admins can delete projects" 
  ON public.project_info 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = project_info.id 
      AND pu.user_id = auth.uid() 
      AND pu.role = 'admin'
    )
  );