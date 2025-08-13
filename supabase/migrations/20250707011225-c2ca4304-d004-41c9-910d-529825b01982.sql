-- Remover a constraint de foreign key primeiro
ALTER TABLE public.project_info 
DROP CONSTRAINT IF EXISTS project_info_sponsor_principal_fkey;

-- Alterar o tipo da coluna para TEXT
ALTER TABLE public.project_info 
ALTER COLUMN sponsor_principal TYPE TEXT;