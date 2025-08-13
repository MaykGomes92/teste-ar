-- Adicionar índices para melhorar performance das queries principais
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_processos_project_id_status 
ON public.processos (project_info_id, status) 
WHERE status = 'Ativo';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_riscos_project_id_validacao 
ON public.riscos (project_info_id, validacao_etapa) 
WHERE archived = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kris_project_id_status 
ON public.kris (project_info_id, status) 
WHERE status = 'Ativo';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_melhorias_project_validacao 
ON public.melhorias (project_info_id, validacao_etapa);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dados_planilhas_project_processo 
ON public.dados_planilhas (project_info_id, processo_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_testes_project_controle 
ON public.testes (project_info_id, controle_id);

-- Índices para lookups de usuários
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_users_user_project 
ON public.project_users (user_id, project_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_perfil 
ON public.profiles (perfil) 
WHERE perfil IS NOT NULL;

-- Índices para queries de status logs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_process_status_logs_processo_created 
ON public.process_status_logs (processo_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_status_logs_risco_created 
ON public.risk_status_logs (risco_id, created_at DESC);

-- Índices compostos para queries do dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_processos_dashboard 
ON public.processos (project_info_id, validacao_etapa, status) 
WHERE status = 'Ativo';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_riscos_dashboard 
ON public.riscos (project_info_id, validacao_etapa, categoria) 
WHERE archived = false;

-- Otimizar consultas de macro processos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_macro_processos_estrutura 
ON public.macro_processos (estrutura_id, project_info_id);

-- Índice para evidências
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dados_planilhas_evidencias 
ON public.dados_planilhas USING gin(evidencia_paths) 
WHERE evidencia_paths IS NOT NULL;

-- Melhorar performance de consultas de convites
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_invitations_token_expires 
ON public.user_invitations (token, expires_at) 
WHERE used_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_temp_profiles_token_used 
ON public.temp_user_profiles (invitation_token, used) 
WHERE used = false;