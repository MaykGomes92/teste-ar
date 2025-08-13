-- Corrigir a função SQL removendo ORDER BY dentro da agregação
DROP FUNCTION IF EXISTS public.get_process_status_logs(TEXT);

-- Recriar função mais simples
CREATE OR REPLACE FUNCTION public.get_process_status_logs(process_id TEXT)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(logs_with_user ORDER BY logs_with_user.created_at DESC), '[]'::json)
    FROM (
      SELECT 
        psl.id,
        psl.processo_id,
        psl.project_info_id,
        psl.status_anterior,
        psl.status_novo,
        psl.usuario_anterior,
        psl.usuario_novo,
        psl.observacoes,
        psl.created_at,
        psl.created_by,
        COALESCE(p.nome, 'Sistema') as created_by_name
      FROM process_status_logs psl
      LEFT JOIN profiles p ON p.id = psl.created_by
      WHERE psl.processo_id = process_id
    ) logs_with_user
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;