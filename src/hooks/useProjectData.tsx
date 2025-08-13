
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectMetrics {
  processos_mapeados: number;
  processos_meta: number;
  riscos_identificados: number;
  riscos_meta: number;
  controles_implementados: number;
  controles_meta: number;
  acoes_melhoria: number;
  acoes_melhoria_meta: number;
  progresso_percentual: number;
  status_projeto: string;
}

interface ProjectDetails {
  id: string;
  project_info_id: string;
  descricao_detalhada?: string;
  escopo?: string;
  restricoes?: string;
  premissas?: string;
  criterios_sucesso?: string;
  status_projeto: string;
  progresso_percentual: number;
  processos_mapeados: number;
  processos_meta: number;
  riscos_identificados: number;
  riscos_meta: number;
  controles_implementados: number;
  controles_meta: number;
  acoes_melhoria: number;
  acoes_melhoria_meta: number;
}

export const useProjectData = (projectId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjectDetails = async () => {
    if (!user || !projectId) {
      setIsLoading(false);
      return;
    }

    try {
      // Remover filtro redundante por user_id - as políticas RLS já controlam o acesso
      const { data, error } = await supabase
        .from('project_details')
        .select('*')
        .eq('project_info_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao carregar detalhes do projeto:', error);
        // Tentar criar detalhes iniciais se não existir
        await createInitialProjectDetails();
        return;
      }

      if (data && data.length > 0) {
        setProjectDetails(data[0]);
      } else {
        // Criar registro inicial se não existir
        await createInitialProjectDetails();
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do projeto:', error);
      // Fallback: tentar criar detalhes iniciais
      await createInitialProjectDetails();
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialProjectDetails = async () => {
    if (!user || !projectId) return;

    try {
      const initialData = {
        project_info_id: projectId,
        user_id: user.id,
        status_projeto: 'Em Planejamento',
        progresso_percentual: 0,
        processos_mapeados: 0,
        processos_meta: 60,
        riscos_identificados: 0,
        riscos_meta: 150,
        controles_implementados: 0,
        controles_meta: 120,
        acoes_melhoria: 0,
        acoes_melhoria_meta: 30
      };

      const { data, error } = await supabase
        .from('project_details')
        .insert(initialData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar detalhes iniciais do projeto:', error);
        return;
      }

      setProjectDetails(data);
      console.log('Detalhes iniciais do projeto criados:', data);
    } catch (error) {
      console.error('Erro ao criar detalhes iniciais do projeto:', error);
    }
  };

  const updateProjectMetrics = async () => {
    if (!projectId) return;

    try {
      // Usar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const updatePromise = supabase.rpc('update_project_metrics', {
        project_id: projectId
      });

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error && error.message !== 'Timeout') {
        console.error('Erro ao atualizar métricas do projeto:', error);
        return;
      }

      // Recarregar os dados após a atualização apenas se não houve timeout
      if (!error || error.message !== 'Timeout') {
        await loadProjectDetails();
      }
    } catch (error) {
      console.warn('Métricas não atualizadas (timeout ou erro):', error);
    }
  };

  const updateProjectDetails = async (updates: Partial<ProjectDetails>) => {
    if (!user || !projectDetails) return;

    try {
      const { data, error } = await supabase
        .from('project_details')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectDetails.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProjectDetails(data);
      
      // Registrar no histórico
      await logProjectChange('atualizacao', 'Detalhes do projeto atualizados', projectDetails, data);

      toast({
        title: "Sucesso",
        description: "Detalhes do projeto atualizados com sucesso!"
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar detalhes do projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar detalhes do projeto. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const logProjectChange = async (
    tipoMudanca: string, 
    descricaoMudanca: string, 
    dadosAnteriores?: any, 
    dadosNovos?: any
  ) => {
    // Skip logging for template project or when no valid project ID
    if (!projectId || projectId === 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01') {
      return;
    }
    
    if (!user) return;

    try {
      // Verificar se o projeto existe antes de tentar inserir no histórico
      const { data: projectExists } = await supabase
        .from('project_info')
        .select('id')
        .eq('id', projectId)
        .single();

      if (!projectExists) {
        console.warn('Projeto não encontrado para log de histórico:', projectId);
        return;
      }

      // Skip logging if there are connection issues to prevent slowing down the app
      const result = await Promise.race([
        supabase.from('project_history').insert({
          project_info_id: projectId,
          user_id: user.id,
          tipo_mudanca: tipoMudanca,
          descricao_mudanca: descricaoMudanca,
          dados_anteriores: dadosAnteriores || null,
          dados_novos: dadosNovos || null
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      const { error } = result as any;

      if (error) {
        console.warn('Histórico não registrado:', error);
      }
    } catch (error) {
      console.warn('Histórico não registrado:', error);
    }
  };

  useEffect(() => {
    loadProjectDetails();
  }, [user, projectId]);

  return {
    projectDetails,
    isLoading,
    updateProjectDetails,
    updateProjectMetrics,
    logProjectChange,
    reloadProjectDetails: loadProjectDetails
  };
};
