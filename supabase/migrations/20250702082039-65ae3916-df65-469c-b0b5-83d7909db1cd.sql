-- Atualizar as métricas do projeto TechCorp para refletir dados reais
UPDATE public.project_details 
SET 
  processos_mapeados = 8,
  processos_meta = 65,
  riscos_identificados = 5,
  riscos_meta = 135,
  controles_implementados = 5,
  controles_meta = 110,
  acoes_melhoria = 3,
  acoes_melhoria_meta = 25,
  progresso_percentual = 75,
  updated_at = now()
WHERE project_info_id = 'dd1aceb7-8477-4b8c-8cd6-f68de1186417';

-- Atualizar a função para calcular métricas automaticamente
CREATE OR REPLACE FUNCTION public.update_project_metrics(project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.project_details 
  SET 
    processos_mapeados = (
      SELECT COUNT(*) FROM public.processos 
      WHERE project_info_id = project_id AND status = 'Ativo'
    ),
    riscos_identificados = (
      SELECT COUNT(*) FROM public.riscos 
      WHERE project_info_id = project_id
    ),
    controles_implementados = (
      SELECT COUNT(*) FROM public.kris 
      WHERE project_info_id = project_id AND status = 'Ativo'
    ),
    acoes_melhoria = (
      SELECT COUNT(*) FROM public.melhorias 
      WHERE project_info_id = project_id
    ),
    progresso_percentual = GREATEST(
      ROUND(
        (
          COALESCE((SELECT COUNT(*) FROM public.processos WHERE project_info_id = project_id AND status = 'Ativo'), 0) * 100.0 / NULLIF(processos_meta, 0) * 0.3 +
          COALESCE((SELECT COUNT(*) FROM public.riscos WHERE project_info_id = project_id), 0) * 100.0 / NULLIF(riscos_meta, 0) * 0.25 +
          COALESCE((SELECT COUNT(*) FROM public.kris WHERE project_info_id = project_id AND status = 'Ativo'), 0) * 100.0 / NULLIF(controles_meta, 0) * 0.35 +
          COALESCE((SELECT COUNT(*) FROM public.melhorias WHERE project_info_id = project_id), 0) * 100.0 / NULLIF(acoes_melhoria_meta, 0) * 0.1
        )
      ), 0
    ),
    updated_at = now()
  WHERE project_info_id = project_id;
END;
$function$;