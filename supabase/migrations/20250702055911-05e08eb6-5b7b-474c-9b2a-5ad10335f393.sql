-- Adicionar as colunas necessárias na tabela melhorias
ALTER TABLE public.melhorias 
ADD COLUMN controle_id UUID,
ADD COLUMN risco_id UUID;