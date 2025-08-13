-- Remover função anterior e criar nova
DROP FUNCTION IF EXISTS public.get_process_status_logs(TEXT);

-- Criar nova função que retorna JSON
CREATE OR REPLACE FUNCTION public.get_process_status_logs(process_id TEXT)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', psl.id,
        'processo_id', psl.processo_id,
        'project_info_id', psl.project_info_id,
        'status_anterior', psl.status_anterior,
        'status_novo', psl.status_novo,
        'usuario_anterior', psl.usuario_anterior,
        'usuario_novo', psl.usuario_novo,
        'observacoes', psl.observacoes,
        'created_at', psl.created_at,
        'created_by', psl.created_by,
        'created_by_name', COALESCE(p.nome, 'Sistema')
      )
    )
    FROM process_status_logs psl
    LEFT JOIN profiles p ON p.id = psl.created_by
    WHERE psl.processo_id = process_id
    ORDER BY psl.created_at DESC
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;