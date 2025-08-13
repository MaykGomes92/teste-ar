-- Criar tabela para logs de backup
CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL,
  arquivo TEXT NOT NULL,
  status TEXT NOT NULL,
  detalhes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para backup_logs
CREATE POLICY "Admins can view backup logs" 
  ON public.backup_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND perfil LIKE 'Orla - Diretor%'
    )
  );

CREATE POLICY "System can insert backup logs" 
  ON public.backup_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Habilitar extensões para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar job de backup semanal (todo domingo às 02:00)
SELECT cron.schedule(
  'weekly-backup-job',
  '0 2 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://hnmznjztywejubergone.supabase.co/functions/v1/weekly-backup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubXpuanp0eXdlanViZXJnb25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjMyMTIsImV4cCI6MjA2Njc5OTIxMn0.cG5ncbzuevSxquaUGRZ2L7v-yhbOxqzdX9q3C5hXSAE"}'::jsonb,
    body := '{"scheduled": true}'::jsonb
  );
  $$
);

-- Limpar projetos mantendo apenas o template do IRB(Re)
-- Manter apenas o projeto: bedaf5d7-aa02-4d46-a692-e16a5acd5e01 (IRB(Re) - Template)
DELETE FROM public.project_details WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.project_history WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.project_users WHERE project_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.dados_planilhas WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.processos WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.riscos WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.kris WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.melhorias WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.testes WHERE project_info_id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');
DELETE FROM public.project_info WHERE id NOT IN ('bedaf5d7-aa02-4d46-a692-e16a5acd5e01');