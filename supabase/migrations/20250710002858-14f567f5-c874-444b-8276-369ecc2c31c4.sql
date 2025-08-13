-- Otimizar função de verificação de acesso ao projeto
CREATE OR REPLACE FUNCTION public.user_can_access_project(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    -- User owns the project
    SELECT 1 FROM public.project_info pi 
    WHERE pi.id = project_uuid AND pi.user_id = auth.uid()
    
    UNION ALL
    
    -- IRB template project (everyone can access)
    SELECT 1 WHERE project_uuid = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01'::uuid
    
    UNION ALL
    
    -- User is assigned to project
    SELECT 1 FROM public.project_users pu 
    WHERE pu.project_id = project_uuid AND pu.user_id = auth.uid()
  );
$function$;

-- Função otimizada para atualizar métricas do projeto
CREATE OR REPLACE FUNCTION public.update_project_metrics(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    processos_count INTEGER := 0;
    riscos_count INTEGER := 0;
    controles_count INTEGER := 0;
    melhorias_count INTEGER := 0;
    progresso_calc INTEGER := 0;
    metas RECORD;
BEGIN
    -- Buscar metas em uma única query
    SELECT 
        COALESCE(processos_meta, 1) as proc_meta,
        COALESCE(riscos_meta, 1) as risk_meta,
        COALESCE(controles_meta, 1) as ctrl_meta,
        COALESCE(acoes_melhoria_meta, 1) as melh_meta
    INTO metas
    FROM public.project_details 
    WHERE project_info_id = project_id;
    
    -- Contar todos os itens em paralelo usando queries otimizadas com índices
    SELECT 
        COUNT(*) FILTER (WHERE status = 'Ativo') as proc_count,
        0 as risk_count,
        0 as ctrl_count,
        0 as melh_count
    INTO processos_count, riscos_count, controles_count, melhorias_count
    FROM public.processos 
    WHERE project_info_id = project_id;
    
    SELECT COUNT(*) INTO riscos_count
    FROM public.riscos 
    WHERE project_info_id = project_id AND archived = false;
    
    SELECT COUNT(*) INTO controles_count
    FROM public.kris 
    WHERE project_info_id = project_id AND status = 'Ativo';
    
    SELECT COUNT(*) INTO melhorias_count
    FROM public.melhorias 
    WHERE project_info_id = project_id;
    
    -- Calcular progresso usando as metas obtidas
    progresso_calc := GREATEST(0, LEAST(100, ROUND(
        (processos_count * 100.0 / metas.proc_meta * 0.3 +
         riscos_count * 100.0 / metas.risk_meta * 0.25 +
         controles_count * 100.0 / metas.ctrl_meta * 0.35 +
         melhorias_count * 100.0 / metas.melh_meta * 0.1)
    )));
    
    -- Atualizar em uma única operação
    UPDATE public.project_details 
    SET 
        processos_mapeados = processos_count,
        riscos_identificados = riscos_count,
        controles_implementados = controles_count,
        acoes_melhoria = melhorias_count,
        progresso_percentual = progresso_calc,
        updated_at = CURRENT_TIMESTAMP
    WHERE project_info_id = project_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE LOG 'Error updating project metrics for %: %', project_id, SQLERRM;
END;
$function$;