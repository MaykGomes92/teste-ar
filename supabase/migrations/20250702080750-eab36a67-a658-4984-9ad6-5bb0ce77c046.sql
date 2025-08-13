-- Copiar dados do template IRB(Re) para o projeto de demonstração TechCorp
-- IDs conhecidos
-- Template: bedaf5d7-aa02-4d46-a692-e16a5acd5e01
-- Demo: dd1aceb7-8477-4b8c-8cd6-f68de1186417

-- 1. Copiar estruturas da cadeia de valor
INSERT INTO public.estruturas_cadeia_valor (nome, descricao, ordem, cor, project_info_id)
SELECT 
  nome,
  descricao,
  ordem,
  cor,
  'dd1aceb7-8477-4b8c-8cd6-f68de1186417'
FROM public.estruturas_cadeia_valor 
WHERE project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- 2. Copiar macro processos (manter IDs originais para referências)
INSERT INTO public.macro_processos (id, nome, descricao, codigo, estrutura_id, project_info_id)
SELECT 
  mp.id,
  mp.nome,
  mp.descricao,
  mp.codigo,
  (SELECT e_new.id FROM public.estruturas_cadeia_valor e_new 
   JOIN public.estruturas_cadeia_valor e_old ON e_old.nome = e_new.nome
   WHERE e_old.id = mp.estrutura_id 
   AND e_new.project_info_id = 'dd1aceb7-8477-4b8c-8cd6-f68de1186417' 
   LIMIT 1),
  'dd1aceb7-8477-4b8c-8cd6-f68de1186417'
FROM public.macro_processos mp
WHERE mp.project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- 3. Copiar processos com novos IDs 
INSERT INTO public.processos (id, nome, descricao, macro_processo, responsavel, status, codigo, macro_processo_id, project_info_id, validacao_etapa)
SELECT 
  -- Gerar novo ID baseado no original mas com sufixo diferente
  CONCAT(SUBSTRING(p.id FROM 1 FOR POSITION('-' IN p.id)), 'DEM'),
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

-- 4. Copiar riscos com adaptações para TechCorp
INSERT INTO public.riscos (nome, descricao, categoria, nivel_impacto, probabilidade, status, codigo, processo_id, project_info_id, responsavel, data_identificacao, validacao_etapa)
SELECT 
  r.nome,
  'TechCorp: ' || r.descricao,
  r.categoria,
  r.nivel_impacto,
  r.probabilidade,
  r.status,
  r.codigo,
  -- Mapear para novo processo_id
  CONCAT(SUBSTRING(r.processo_id FROM 1 FOR POSITION('-' IN r.processo_id)), 'DEM'),
  'dd1aceb7-8477-4b8c-8cd6-f68de1186417',
  CASE 
    WHEN r.responsavel IS NOT NULL THEN 'Gerência TechCorp - ' || r.responsavel
    ELSE 'Gerência TechCorp'
  END,
  '2024-02-01',
  2 -- Em revisão
FROM public.riscos r
WHERE r.project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

-- 5. Copiar KRIs/Controles
INSERT INTO public.kris (nome, descricao, categoria, tipo_medicao, frequencia_medicao, status, codigo, processo_id, project_info_id, responsavel, meta_tier1, meta_tier2, meta_tier3, validacao_etapa)
SELECT 
  k.nome,
  'TechCorp: ' || k.descricao,
  k.categoria,
  k.tipo_medicao,
  k.frequencia_medicao,
  k.status,
  k.codigo,
  -- Mapear para novo processo_id
  CONCAT(SUBSTRING(k.processo_id FROM 1 FOR POSITION('-' IN k.processo_id)), 'DEM'),
  'dd1aceb7-8477-4b8c-8cd6-f68de1186417',
  CASE 
    WHEN k.responsavel IS NOT NULL THEN 'Controles TechCorp - ' || k.responsavel
    ELSE 'Controles TechCorp'
  END,
  k.meta_tier1,
  k.meta_tier2,
  k.meta_tier3,
  2 -- Em implementação
FROM public.kris k
WHERE k.project_info_id = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';