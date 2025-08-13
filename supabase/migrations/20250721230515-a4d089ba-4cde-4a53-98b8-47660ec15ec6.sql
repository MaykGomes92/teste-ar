-- Adicionar campos para upload de arquivos do fluxograma
ALTER TABLE public.processos 
ADD COLUMN fluxograma_attachment_names text[],
ADD COLUMN fluxograma_attachment_paths text[],
ADD COLUMN fluxograma_attachment_dates text[];

-- Comentários para documentação
COMMENT ON COLUMN public.processos.fluxograma_attachment_names IS 'Nomes dos arquivos de fluxograma carregados';
COMMENT ON COLUMN public.processos.fluxograma_attachment_paths IS 'Caminhos dos arquivos de fluxograma no storage';
COMMENT ON COLUMN public.processos.fluxograma_attachment_dates IS 'Datas de upload dos arquivos de fluxograma';