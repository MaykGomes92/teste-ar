-- Adicionar campos de validação para fluxograma na tabela processos
ALTER TABLE public.processos 
ADD COLUMN fluxograma_validacao text DEFAULT 'pendente',
ADD COLUMN fluxograma_validado_por uuid,
ADD COLUMN fluxograma_validado_em timestamp with time zone;

-- Adicionar campos para controle de versão de arquivos
ALTER TABLE public.processos
ADD COLUMN arquivo_versoes jsonb DEFAULT '[]'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN public.processos.fluxograma_validacao IS 'Status de validação do fluxograma: pendente, revisao, aprovado';
COMMENT ON COLUMN public.processos.fluxograma_validado_por IS 'ID do usuário que validou o fluxograma';
COMMENT ON COLUMN public.processos.fluxograma_validado_em IS 'Data/hora da validação do fluxograma';
COMMENT ON COLUMN public.processos.arquivo_versoes IS 'Histórico de versões dos arquivos do processo (BPMN, RACI, Descritivo)';