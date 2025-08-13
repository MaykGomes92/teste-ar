-- Deletar os projetos específicos mencionados
DELETE FROM public.project_info 
WHERE nome_projeto IN (
  'Sistema de Controles Internos - Empresa ABC',
  'Sistema de Controles Internos - Modelo Consultoria'
);