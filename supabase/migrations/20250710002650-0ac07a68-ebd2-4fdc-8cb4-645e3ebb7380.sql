-- Continuar com mais índices
CREATE INDEX IF NOT EXISTS idx_process_status_logs_processo_created 
ON public.process_status_logs (processo_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_risk_status_logs_risco_created 
ON public.risk_status_logs (risco_id, created_at DESC);

-- Índices compostos para queries do dashboard
CREATE INDEX IF NOT EXISTS idx_processos_dashboard 
ON public.processos (project_info_id, validacao_etapa, status) 
WHERE status = 'Ativo';

CREATE INDEX IF NOT EXISTS idx_riscos_dashboard 
ON public.riscos (project_info_id, validacao_etapa, categoria) 
WHERE archived = false;

-- Otimizar consultas de macro processos
CREATE INDEX IF NOT EXISTS idx_macro_processos_estrutura 
ON public.macro_processos (estrutura_id, project_info_id);

-- Melhorar performance de consultas de convites
CREATE INDEX IF NOT EXISTS idx_user_invitations_token_expires 
ON public.user_invitations (token, expires_at) 
WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_temp_profiles_token_used 
ON public.temp_user_profiles (invitation_token, used) 
WHERE used = false;