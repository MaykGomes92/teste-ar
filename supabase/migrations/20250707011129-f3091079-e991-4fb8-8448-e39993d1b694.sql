-- Alterar o campo sponsor_principal de UUID para TEXT
ALTER TABLE public.project_info 
ALTER COLUMN sponsor_principal TYPE TEXT;