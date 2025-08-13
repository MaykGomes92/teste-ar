-- Criar função RPC para buscar logs de status com dados do usuário
CREATE OR REPLACE FUNCTION public.get_process_status_logs(process_id TEXT)
RETURNS TABLE(
  id UUID,
  processo_id TEXT,
  project_info_id UUID,
  status_anterior INTEGER,
  status_novo INTEGER,
  usuario_anterior UUID,
  usuario_novo UUID,
  observacoes TEXT,
  created_at TIMESTAMPTZ,
  created_by UUID,
  created_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
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
  ORDER BY psl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;