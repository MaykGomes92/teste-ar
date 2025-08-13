-- Testar se há problema com foreign keys no trigger
-- Primeiro vamos verificar se as foreign keys estão corretas

-- 1. Verificar relacionamentos existentes
SELECT 
    conname,
    pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.process_status_logs'::regclass
AND contype = 'f';

-- 2. Verificar se a função do trigger existe e está correta
SELECT proname, prosrc FROM pg_proc WHERE proname = 'log_process_status_change';

-- 3. Tentar uma atualização simples para testar
-- Vamos atualizar o primeiro processo para etapa 1
UPDATE public.processos 
SET validacao_etapa = 1, updated_at = now()
WHERE id = 'PRO.REA.001' 
AND project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- 4. Verificar se foi criado um log
SELECT * FROM process_status_logs WHERE processo_id = 'PRO.REA.001';