-- Adicionar índices para melhorar performance das queries principais
CREATE INDEX IF NOT EXISTS idx_processos_project_id_status 
ON public.processos (project_info_id, status) 
WHERE status = 'Ativo';

CREATE INDEX IF NOT EXISTS idx_riscos_project_id_validacao 
ON public.riscos (project_info_id, validacao_etapa) 
WHERE archived = false;

CREATE INDEX IF NOT EXISTS idx_kris_project_id_status 
ON public.kris (project_info_id, status) 
WHERE status = 'Ativo';

CREATE INDEX IF NOT EXISTS idx_melhorias_project_validacao 
ON public.melhorias (project_info_id, validacao_etapa);

CREATE INDEX IF NOT EXISTS idx_dados_planilhas_project_processo 
ON public.dados_planilhas (project_info_id, processo_id);

CREATE INDEX IF NOT EXISTS idx_testes_project_controle 
ON public.testes (project_info_id, controle_id);

-- Índices para lookups de usuários
CREATE INDEX IF NOT EXISTS idx_project_users_user_project 
ON public.project_users (user_id, project_id);

CREATE INDEX IF NOT EXISTS idx_profiles_perfil 
ON public.profiles (perfil) 
WHERE perfil IS NOT NULL;