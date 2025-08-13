-- Criar foreign key entre process_status_logs e profiles
ALTER TABLE public.process_status_logs 
ADD CONSTRAINT process_status_logs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- Verificar se a constraint foi criada
SELECT 
    conname,
    pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.process_status_logs'::regclass
AND contype = 'f';