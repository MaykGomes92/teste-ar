-- Vamos verificar se existem dados no template primeiro
SELECT COUNT(*) as total_processos FROM public.processos WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- Copiar processos corretamente
INSERT INTO public.processos (id, nome, descricao, macro_processo, responsavel, status, codigo, macro_processo_id, project_info_id, validacao_etapa)
SELECT 
  -- Gerar novo ID baseado no original 
  CASE 
    WHEN p.id LIKE '%-%' THEN CONCAT(SUBSTRING(p.id FROM 1 FOR POSITION('-' IN p.id)), 'DEM')
    ELSE CONCAT(p.id, '-DEM')
  END,
  p.nome,
  p.descricao,
  p.macro_processo,
  CASE 
    WHEN p.responsavel IS NOT NULL THEN 'Equipe TechCorp - ' || p.responsavel
    ELSE 'Equipe TechCorp'
  END,
  p.status,
  p.codigo,
  p.macro_processo_id,
  'dd1aceb7-8477-4b8c-8cd6-f68de1186417',
  3 -- Validado
FROM public.processos p
WHERE p.project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';