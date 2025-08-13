-- Adicionar colunas de arquivamento na tabela riscos
ALTER TABLE public.riscos 
ADD COLUMN archived boolean DEFAULT false,
ADD COLUMN archived_at timestamp with time zone,
ADD COLUMN archived_by uuid REFERENCES auth.users(id);

-- Criar índice para melhorar performance de consultas de riscos arquivados
CREATE INDEX idx_riscos_archived ON public.riscos(archived, project_info_id);

-- Criar trigger para registrar mudanças de status de validação de riscos
CREATE TRIGGER log_risk_status_change_trigger
  AFTER UPDATE ON public.riscos
  FOR EACH ROW
  EXECUTE FUNCTION public.log_risk_status_change();

-- Adicionar RLS policies para risk_status_logs se necessário
-- (As policies já existem, mas vamos garantir que estão corretas)

-- Função para arquivar/desarquivar riscos
CREATE OR REPLACE FUNCTION public.archive_risk(
  risk_id uuid,
  should_archive boolean,
  user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.riscos 
  SET 
    archived = should_archive,
    archived_at = CASE WHEN should_archive THEN CURRENT_TIMESTAMP ELSE NULL END,
    archived_by = CASE WHEN should_archive THEN user_id ELSE NULL END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = risk_id;
END;
$$;

-- Função para buscar logs de status de riscos
CREATE OR REPLACE FUNCTION public.get_risk_status_logs(risk_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(logs_with_user ORDER BY logs_with_user.created_at DESC), '[]'::json)
    FROM (
      SELECT 
        rsl.id,
        rsl.risco_id,
        rsl.project_info_id,
        rsl.status_anterior,
        rsl.status_novo,
        rsl.usuario_anterior,
        rsl.usuario_novo,
        rsl.observacoes,
        rsl.created_at,
        rsl.created_by,
        COALESCE(p.nome, 'Sistema') as created_by_name
      FROM risk_status_logs rsl
      LEFT JOIN profiles p ON p.id = rsl.created_by
      WHERE rsl.risco_id = risk_id
    ) logs_with_user
  );
END;
$$;