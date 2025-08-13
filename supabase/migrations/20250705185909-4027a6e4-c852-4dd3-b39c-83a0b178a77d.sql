-- Limpar registros com created_by inválido ou criar perfil sistema
-- Primeiro, criar um perfil padrão para o sistema
INSERT INTO public.profiles (id, nome, perfil)
VALUES ('00000000-0000-0000-0000-000000000000', 'Sistema', 'Sistema')
ON CONFLICT (id) DO NOTHING;

-- Agora criar a foreign key
ALTER TABLE public.process_status_logs 
ADD CONSTRAINT process_status_logs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id);