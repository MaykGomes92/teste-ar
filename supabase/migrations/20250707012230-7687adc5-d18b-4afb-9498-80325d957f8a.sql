-- Habilitar realtime para a tabela project_info
ALTER TABLE public.project_info REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_info;