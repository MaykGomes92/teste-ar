-- Adicionar a coluna risco_id faltante na tabela testes
ALTER TABLE public.testes 
ADD COLUMN risco_id UUID;