-- Adicionar campos para validação de RACI e Descritivo de Processos
ALTER TABLE public.processos 
ADD COLUMN raci_validacao TEXT DEFAULT 'pendente',
ADD COLUMN raci_validado_por UUID,
ADD COLUMN raci_validado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN descritivo_validacao TEXT DEFAULT 'pendente',
ADD COLUMN descritivo_validado_por UUID,
ADD COLUMN descritivo_validado_em TIMESTAMP WITH TIME ZONE;

-- Comentários para documentar os campos
COMMENT ON COLUMN public.processos.raci_validacao IS 'Status da validação da matriz RACI: pendente, revisao, aprovado';
COMMENT ON COLUMN public.processos.raci_validado_por IS 'ID do usuário que validou a matriz RACI';
COMMENT ON COLUMN public.processos.raci_validado_em IS 'Data e hora da validação da matriz RACI';
COMMENT ON COLUMN public.processos.descritivo_validacao IS 'Status da validação do descritivo: pendente, revisao, aprovado';
COMMENT ON COLUMN public.processos.descritivo_validado_por IS 'ID do usuário que validou o descritivo';
COMMENT ON COLUMN public.processos.descritivo_validado_em IS 'Data e hora da validação do descritivo';