-- Testar novamente a atualização do processo 
UPDATE public.processos 
SET validacao_etapa = 2, updated_at = now()
WHERE id = 'PRO.REA.001' 
AND project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- Verificar se foi criado o log
SELECT * FROM process_status_logs WHERE processo_id = 'PRO.REA.001' ORDER BY created_at DESC;