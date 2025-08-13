-- Atualizar descrição do objetivo do projeto IRB
UPDATE public.project_info 
SET objetivo_projeto = 'Implementação de framework baseado na metodologia COSO'
WHERE id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid;