-- Criar tabela para logs de mudanças de status dos processos
CREATE TABLE public.process_status_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id TEXT NOT NULL,
  project_info_id UUID,
  status_anterior INTEGER,
  status_novo INTEGER NOT NULL,
  usuario_anterior UUID,
  usuario_novo UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL DEFAULT auth.uid()
);

-- Enable Row Level Security
ALTER TABLE public.process_status_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for process status logs
CREATE POLICY "Users can view status logs in their projects" 
ON public.process_status_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM project_users pu 
  WHERE pu.project_id = process_status_logs.project_info_id 
  AND pu.user_id = auth.uid()
));

CREATE POLICY "Users can create status logs" 
ON public.process_status_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM project_users pu 
  WHERE pu.project_id = process_status_logs.project_info_id 
  AND pu.user_id = auth.uid()
) AND created_by = auth.uid());

-- Create function to automatically log status changes
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
      usuario_anterior,
      usuario_novo,
      created_by
    ) VALUES (
      NEW.id,
      NEW.project_info_id,
      OLD.validacao_etapa,
      NEW.validacao_etapa,
      OLD.user_id,
      NEW.user_id,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log status changes on processos table
CREATE TRIGGER process_status_change_trigger
  AFTER UPDATE ON public.processos
  FOR EACH ROW
  EXECUTE FUNCTION public.log_process_status_change();