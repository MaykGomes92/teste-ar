-- Otimizar políticas RLS para evitar warnings e melhorar performance
-- Criar políticas mais eficientes usando índices

-- Otimizar política de project_users para evitar scans desnecessários
DROP POLICY IF EXISTS "Project creators can manage all project users" ON public.project_users;
CREATE POLICY "Project creators can manage all project users" 
ON public.project_users 
FOR ALL 
TO authenticated
USING (
    project_id IN (
        SELECT id FROM public.project_info 
        WHERE user_id = auth.uid()
    )
);

-- Criar política mais específica para melhor performance
CREATE POLICY "Users can view own project membership" 
ON public.project_users 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Otimizar políticas das tabelas principais
DROP POLICY IF EXISTS "Users can view processes in their projects" ON public.processos;
CREATE POLICY "Users can view processes in their projects" 
ON public.processos 
FOR SELECT 
TO authenticated
USING (
    project_info_id IN (
        SELECT project_id FROM public.project_users 
        WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can view risks in their projects" ON public.riscos;
CREATE POLICY "Users can view risks in their projects" 
ON public.riscos 
FOR SELECT 
TO authenticated
USING (
    project_info_id IN (
        SELECT project_id FROM public.project_users 
        WHERE user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can view KRIs in their projects" ON public.kris;
CREATE POLICY "Users can view KRIs in their projects" 
ON public.kris 
FOR SELECT 
TO authenticated
USING (
    project_info_id IN (
        SELECT project_id FROM public.project_users 
        WHERE user_id = auth.uid()
    )
);

-- Criar função para verificar acesso ao projeto de forma eficiente
CREATE OR REPLACE FUNCTION public.user_has_project_access(project_uuid uuid)
RETURNS boolean
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.project_users 
        WHERE project_id = project_uuid 
        AND user_id = auth.uid()
    );
$$;

-- Otimizar políticas usando a função
DROP POLICY IF EXISTS "Project users can manage processes" ON public.processos;
CREATE POLICY "Project users can manage processes" 
ON public.processos 
FOR ALL 
TO authenticated
USING (public.user_has_project_access(project_info_id));

-- Limpar triggers duplicados que podem estar causando warnings
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    -- Remover triggers duplicados do process status logging
    FOR trigger_rec IN 
        SELECT tgname, relname 
        FROM pg_trigger t 
        JOIN pg_class c ON t.tgrelid = c.oid 
        WHERE tgname LIKE '%log_process_status%'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trigger_rec.tgname, trigger_rec.relname);
    END LOOP;
    
    -- Recriar trigger único e otimizado
    CREATE TRIGGER log_process_status_change_trigger
        AFTER UPDATE OF validacao_etapa ON public.processos
        FOR EACH ROW
        WHEN (OLD.validacao_etapa IS DISTINCT FROM NEW.validacao_etapa)
        EXECUTE FUNCTION public.log_process_status_change();
        
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error cleaning triggers: %', SQLERRM;
END $$;

-- Criar função de limpeza de dados órfãos para executar periodicamente
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Limpar convites expirados
    DELETE FROM public.user_invitations 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Limpar temp profiles usados há mais de 7 dias
    DELETE FROM public.temp_user_profiles 
    WHERE used = true 
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    -- Log de limpeza
    RAISE LOG 'Cleanup completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error during cleanup: %', SQLERRM;
END;
$$;

-- Garantir que tabelas tenham configurações adequadas para evitar warnings
ALTER TABLE public.project_info SET (fillfactor = 90);
ALTER TABLE public.project_users SET (fillfactor = 90);
ALTER TABLE public.processos SET (fillfactor = 85);
ALTER TABLE public.riscos SET (fillfactor = 85);
ALTER TABLE public.kris SET (fillfactor = 85);