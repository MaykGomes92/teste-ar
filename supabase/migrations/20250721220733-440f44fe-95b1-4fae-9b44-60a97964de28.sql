-- Adicionar campos para upload e versionamento de documentos RACI e Descritivo
ALTER TABLE public.processos 
ADD COLUMN raci_attachment_names text[],
ADD COLUMN raci_attachment_paths text[],
ADD COLUMN raci_attachment_dates text[],
ADD COLUMN descritivo_attachment_names text[],
ADD COLUMN descritivo_attachment_paths text[],
ADD COLUMN descritivo_attachment_dates text[];