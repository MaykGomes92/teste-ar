-- Adicionar novos campos para controles
ALTER TABLE public.kris 
ADD COLUMN IF NOT EXISTS objetivo text,
ADD COLUMN IF NOT EXISTS atividade text,
ADD COLUMN IF NOT EXISTS forma_atuacao text,
ADD COLUMN IF NOT EXISTS forma_execucao text,
ADD COLUMN IF NOT EXISTS periodicidade text,
ADD COLUMN IF NOT EXISTS prioridade text;