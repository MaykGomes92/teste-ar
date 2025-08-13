-- Resetar o processo para permitir teste do usuário
UPDATE public.processos 
SET validacao_etapa = 0, updated_at = now()
WHERE id = 'PRO.REA.001' 
AND project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- Verificar status atual
SELECT id, nome, validacao_etapa FROM processos WHERE id = 'PRO.REA.001';