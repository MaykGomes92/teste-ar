-- Adicionar campos area, causas e consequencias na tabela riscos
ALTER TABLE public.riscos 
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS causas text,
ADD COLUMN IF NOT EXISTS consequencias text;