-- Update RLS policies for all operational tables to filter by project

-- PROCESSOS
DROP POLICY IF EXISTS "Usuários podem ver todos os processos" ON public.processos;
CREATE POLICY "Users can view processes in their projects" 
  ON public.processos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = processos.project_info_id 
      AND pu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem inserir processos" ON public.processos;
CREATE POLICY "Project users can insert processes" 
  ON public.processos 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = processos.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar processos" ON public.processos;
CREATE POLICY "Project users can update processes" 
  ON public.processos 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = processos.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );

-- RISCOS
DROP POLICY IF EXISTS "Usuários podem ver todos os riscos" ON public.riscos;
CREATE POLICY "Users can view risks in their projects" 
  ON public.riscos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = riscos.project_info_id 
      AND pu.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem inserir riscos" ON public.riscos;
CREATE POLICY "Project users can insert risks" 
  ON public.riscos 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = riscos.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar riscos" ON public.riscos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar riscos" ON public.riscos;
CREATE POLICY "Project users can update risks" 
  ON public.riscos 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = riscos.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );

CREATE POLICY "Project users can delete risks" 
  ON public.riscos 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = riscos.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager')
    )
  );

-- KRIS
DROP POLICY IF EXISTS "Todos podem visualizar KRIs" ON public.kris;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir KRIs" ON public.kris;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar KRIs" ON public.kris;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar KRIs" ON public.kris;

CREATE POLICY "Users can view KRIs in their projects" 
  ON public.kris 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = kris.project_info_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Project users can manage KRIs" 
  ON public.kris 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.project_users pu 
      WHERE pu.project_id = kris.project_info_id 
      AND pu.user_id = auth.uid() 
      AND pu.role IN ('admin', 'manager', 'user')
    )
  );