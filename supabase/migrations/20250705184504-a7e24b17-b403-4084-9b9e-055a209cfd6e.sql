-- Corrigir a função do trigger - tabela processos não tem campo user_id
CREATE OR REPLACE FUNCTION public.log_process_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if validacao_etapa actually changed
  IF OLD.validacao_etapa IS DISTINCT FROM NEW.validacao_etapa THEN
    INSERT INTO public.process_status_logs (
      processo_id,
      project_info_id,
      status_anterior,
      status_novo,
      created_by
    ) VALUES (
      NEW.id,
      NEW.project_info_id,
      OLD.validacao_etapa,
      NEW.validacao_etapa,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;