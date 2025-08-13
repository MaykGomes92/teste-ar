-- Melhorar função de limpeza automática
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Limpar convites expirados (mais de 30 dias)
    DELETE FROM public.user_invitations 
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Limpar temp profiles usados há mais de 30 dias
    DELETE FROM public.temp_user_profiles 
    WHERE used = true 
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Limpar logs de status antigos (mais de 1 ano)
    DELETE FROM public.process_status_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    DELETE FROM public.risk_status_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Limpar histórico de projetos antigo (mais de 2 anos)
    DELETE FROM public.project_history 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
    
    -- Log de limpeza
    RAISE LOG 'Cleanup completed successfully at %', CURRENT_TIMESTAMP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error during cleanup: %', SQLERRM;
END;
$function$;

-- Função para análise de performance das queries
CREATE OR REPLACE FUNCTION public.analyze_query_performance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Atualizar estatísticas das tabelas principais
    ANALYZE public.processos;
    ANALYZE public.riscos;
    ANALYZE public.kris;
    ANALYZE public.melhorias;
    ANALYZE public.dados_planilhas;
    ANALYZE public.project_users;
    ANALYZE public.profiles;
    
    RAISE LOG 'Query performance analysis completed at %', CURRENT_TIMESTAMP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error during performance analysis: %', SQLERRM;
END;
$function$;