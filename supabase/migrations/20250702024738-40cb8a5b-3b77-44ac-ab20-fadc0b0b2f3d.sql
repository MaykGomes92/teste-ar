-- Associate Guilherme with existing projects as admin
INSERT INTO public.project_users (project_id, user_id, role)
SELECT pi.id, 'f402f622-09e7-4e45-be87-814ecf999017', 'admin'
FROM public.project_info pi 
WHERE pi.user_id = 'f402f622-09e7-4e45-be87-814ecf999017'
ON CONFLICT (project_id, user_id) DO NOTHING;