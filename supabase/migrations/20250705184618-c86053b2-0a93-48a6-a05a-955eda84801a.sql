-- Tornar created_by nullable temporariamente para migrations e ajustar função
ALTER TABLE public.process_status_logs 
ALTER COLUMN created_by DROP NOT NULL;

-- Ajustar a função para lidar com auth.uid() sendo null
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
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;