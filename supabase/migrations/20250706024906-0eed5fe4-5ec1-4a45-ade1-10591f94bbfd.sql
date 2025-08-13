-- Limpar índices duplicados e otimizar performance para evitar warnings
-- Criar índices necessários para evitar full table scans

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_project_users_project_user 
ON public.project_users (project_id, user_id);

CREATE INDEX IF NOT EXISTS idx_processos_project_id 
ON public.processos (project_info_id);

CREATE INDEX IF NOT EXISTS idx_riscos_project_id 
ON public.riscos (project_info_id);

CREATE INDEX IF NOT EXISTS idx_riscos_processo_id 
ON public.riscos (processo_id);

CREATE INDEX IF NOT EXISTS idx_kris_project_id 
ON public.kris (project_info_id);

CREATE INDEX IF NOT EXISTS idx_kris_processo_id 
ON public.kris (processo_id);

CREATE INDEX IF NOT EXISTS idx_melhorias_project_id 
ON public.melhorias (project_info_id);

CREATE INDEX IF NOT EXISTS idx_dados_planilhas_project_id 
ON public.dados_planilhas (project_info_id);

CREATE INDEX IF NOT EXISTS idx_project_details_project_id 
ON public.project_details (project_info_id);

CREATE INDEX IF NOT EXISTS idx_profiles_perfil 
ON public.profiles (perfil) WHERE perfil IS NOT NULL;

-- Otimizar função de métricas do projeto para evitar timeouts
CREATE OR REPLACE FUNCTION public.update_project_metrics(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    processos_count INTEGER := 0;
    riscos_count INTEGER := 0;
    controles_count INTEGER := 0;
    melhorias_count INTEGER := 0;
    progresso_calc INTEGER := 0;
BEGIN
    -- Usar queries otimizadas com índices
    SELECT COUNT(*) INTO processos_count
    FROM public.processos 
    WHERE project_info_id = project_id AND status = 'Ativo';
    
    SELECT COUNT(*) INTO riscos_count
    FROM public.riscos 
    WHERE project_info_id = project_id;
    
    SELECT COUNT(*) INTO controles_count
    FROM public.kris 
    WHERE project_info_id = project_id AND status = 'Ativo';
    
    SELECT COUNT(*) INTO melhorias_count
    FROM public.melhorias 
    WHERE project_info_id = project_id;
    
    -- Calcular progresso de forma mais eficiente
    SELECT GREATEST(
        ROUND(
            (processos_count * 100.0 / NULLIF(processos_meta, 0) * 0.3 +
             riscos_count * 100.0 / NULLIF(riscos_meta, 0) * 0.25 +
             controles_count * 100.0 / NULLIF(controles_meta, 0) * 0.35 +
             melhorias_count * 100.0 / NULLIF(acoes_melhoria_meta, 0) * 0.1)
        ), 0
    ) INTO progresso_calc
    FROM public.project_details 
    WHERE project_info_id = project_id;
    
    -- Atualizar em uma única query
    UPDATE public.project_details 
    SET 
        processos_mapeados = processos_count,
        riscos_identificados = riscos_count,
        controles_implementados = controles_count,
        acoes_melhoria = melhorias_count,
        progresso_percentual = COALESCE(progresso_calc, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE project_info_id = project_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE LOG 'Error updating project metrics for %: %', project_id, SQLERRM;
END;
$$;

-- Limpar dados órfãos que podem estar causando warnings de integridade
DELETE FROM public.riscos 
WHERE processo_id IS NOT NULL 
AND processo_id NOT IN (SELECT id FROM public.processos);

DELETE FROM public.kris 
WHERE processo_id IS NOT NULL 
AND processo_id NOT IN (SELECT id FROM public.processos);

DELETE FROM public.kris 
WHERE risco_id IS NOT NULL 
AND risco_id NOT IN (SELECT id FROM public.riscos);

-- Atualizar estatísticas das tabelas para melhor performance
ANALYZE public.project_info;
ANALYZE public.project_users;
ANALYZE public.processos;
ANALYZE public.riscos;
ANALYZE public.kris;
ANALYZE public.profiles;