-- Adicionar coluna atual_novo na tabela riscos
ALTER TABLE public.riscos ADD COLUMN atual_novo text DEFAULT 'Atual';

-- Criar tabela para logs de mudanças de status dos riscos
CREATE TABLE public.risk_status_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  risco_id UUID NOT NULL,
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
ALTER TABLE public.risk_status_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for risk status logs
CREATE POLICY "Users can view risk status logs in their projects" 
ON public.risk_status_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM project_users pu 
  WHERE pu.project_id = risk_status_logs.project_info_id 
  AND pu.user_id = auth.uid()
));

CREATE POLICY "Users can create risk status logs" 
ON public.risk_status_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM project_users pu 
  WHERE pu.project_id = risk_status_logs.project_info_id 
  AND pu.user_id = auth.uid()
) AND created_by = auth.uid());

-- Create function to automatically log risk status changes
CREATE OR REPLACE FUNCTION public.log_risk_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if validacao_etapa actually changed
  IF OLD.validacao_etapa IS DISTINCT FROM NEW.validacao_etapa THEN
    INSERT INTO public.risk_status_logs (
      risco_id,
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

-- Create trigger to automatically log status changes on riscos table
CREATE TRIGGER risk_status_change_trigger
  AFTER UPDATE ON public.riscos
  FOR EACH ROW
  EXECUTE FUNCTION public.log_risk_status_change();