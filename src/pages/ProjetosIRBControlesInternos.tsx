import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Shield, FileText, Users, BarChart3, Target, AlertTriangle, CheckCircle, Settings, Eye, Plus, Building, Layers, GitBranch, TestTube, TrendingUp, PenTool, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProjectData } from "@/hooks/useProjectData";
import ValueChain from "@/components/ValueChain";
import ProcessMapping from "@/components/ProcessMapping";
import COSOIntegratedFramework from "@/components/COSOIntegratedFramework";
import RiskMatrix from "@/components/RiskMatrix";
import NextGenHeader from '@/components/NextGenHeader';

const ProjetosIRBControlesInternos = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("processos");
  const [estruturas, setEstruturas] = useState([]);
  const [macroProcessos, setMacroProcessos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [riscos, setRiscos] = useState([]);
  const [controles, setControles] = useState([]);
  const [melhorias, setMelhorias] = useState([]);
  const [testes, setTestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectInfo, setProjectInfo] = useState(null);

  // ID do projeto template IRB
  const irbProjectId = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
  
  // Usar o hook para dados do projeto
  const { projectDetails, updateProjectMetrics } = useProjectData(irbProjectId);

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Carregar informações do projeto
      const { data: projectData, error: projectError } = await supabase
        .from('project_info')
        .select('*')
        .eq('id', irbProjectId)
        .single();

      if (projectError) throw projectError;
      setProjectInfo(projectData);

      // Carregar todos os dados em paralelo
      const [
        estruturasRes,
        macroProcessosRes,
        processosRes,
        riscosRes,
        controlesRes,
        melhoriasRes,
        testesRes
      ] = await Promise.all([
        supabase
          .from('estruturas_cadeia_valor')
          .select('*')
          .eq('project_info_id', irbProjectId)
          .order('ordem'),
        supabase
          .from('macro_processos')
          .select('*')
          .eq('project_info_id', irbProjectId),
        supabase
          .from('processos')
          .select('*')
          .eq('project_info_id', irbProjectId)
          .order('nome'),
        supabase
          .from('riscos')
          .select('*')
          .eq('project_info_id', irbProjectId)
          .eq('archived', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('kris')
          .select('*')
          .eq('project_info_id', irbProjectId)
          .eq('status', 'Ativo')
          .order('created_at', { ascending: false }),
        supabase
          .from('melhorias')
          .select('*')
          .eq('project_info_id', irbProjectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('testes')
          .select('*')
          .eq('project_info_id', irbProjectId)
          .order('created_at', { ascending: false })
      ]);

      if (estruturasRes.error) throw estruturasRes.error;
      if (macroProcessosRes.error) throw macroProcessosRes.error;
      if (processosRes.error) throw processosRes.error;
      if (riscosRes.error) throw riscosRes.error;
      if (controlesRes.error) throw controlesRes.error;
      if (melhoriasRes.error) throw melhoriasRes.error;
      if (testesRes.error) throw testesRes.error;

      setEstruturas(estruturasRes.data || []);
      setMacroProcessos(macroProcessosRes.data || []);
      setProcessos(processosRes.data || []);
      setRiscos(riscosRes.data || []);
      setControles(controlesRes.data || []);
      setMelhorias(melhoriasRes.data || []);
      setTestes(testesRes.data || []);

      // Atualizar métricas do projeto
      updateProjectMetrics();

    } catch (error) {
      console.error('Erro ao carregar dados do projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do projeto Empresa ABC",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Inativo": return "bg-red-100 text-red-800 border-red-200";
      case "Em Desenvolvimento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getValidationStepLabel = (step: number) => {
    switch (step) {
      case 0: return "Não Iniciado";
      case 1: return "Em desenvolvimento";
      case 2: return "Em revisão";
      case 3: return "Aprovação QA CI";
      case 4: return "Aprovação Cliente";
      case 5: return "Aprovação CI";
      case 6: return "Concluído";
      default: return "Não Iniciado";
    }
  };

  const getValidationStepColor = (step: number) => {
    switch (step) {
      case 0: return "bg-gray-100 text-gray-800";
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-orange-100 text-orange-800";
      case 4: return "bg-purple-100 text-purple-800";
      case 5: return "bg-green-100 text-green-800";
      case 6: return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando dados do projeto Empresa ABC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NextGenHeader 
        title={projectInfo?.nome_projeto || 'Controles Internos - Empresa ABC'}
        subtitle={projectInfo?.objetivo_projeto || 'Sistema integrado de Governança, Riscos e Controles baseado em COSO e ISO 31000'}
        badges={{
          cliente: projectInfo?.cliente || 'Empresa ABC',
          progresso: `${projectDetails?.progresso_percentual || 0}%`,
          status: projectDetails?.status_projeto || 'Em Andamento'
        }}
        homeLink="/grc-nextgen-suit-landing-demo"
        showBackButton={true}
      />

      {/* Dashboard de Métricas */}
      <section className="py-8 px-6 bg-gradient-to-br from-background via-accent/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estruturas Cadeia</p>
                    <p className="text-2xl font-bold">{estruturas.length}</p>
                    <p className="text-xs text-muted-foreground">Macro: {macroProcessos.length}</p>
                  </div>
                  <Layers className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processos Mapeados</p>
                    <p className="text-2xl font-bold">{processos.length}</p>
                    <p className="text-xs text-muted-foreground">Meta: {projectDetails?.processos_meta || 20}</p>
                  </div>
                  <Building className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Riscos Identificados</p>
                    <p className="text-2xl font-bold">{riscos.length}</p>
                    <p className="text-xs text-muted-foreground">Meta: {projectDetails?.riscos_meta || 25}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Controles (KRIs)</p>
                    <p className="text-2xl font-bold">{controles.length}</p>
                    <p className="text-xs text-muted-foreground">Meta: {projectDetails?.controles_meta || 15}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Testes de Desenho</p>
                    <p className="text-2xl font-bold">{Math.floor(testes.length / 2)}</p>
                    <p className="text-xs text-muted-foreground">Design Testing</p>
                  </div>
                  <PenTool className="w-8 h-8 text-cyan-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Testes de Efetividade</p>
                    <p className="text-2xl font-bold">{Math.ceil(testes.length / 2)}</p>
                    <p className="text-xs text-muted-foreground">Effectiveness Testing</p>
                  </div>
                  <TestTube className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Oportunidades de Melhorias</p>
                    <p className="text-2xl font-bold">{melhorias.length}</p>
                    <p className="text-xs text-muted-foreground">Meta: {projectDetails?.acoes_melhoria_meta || 10}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal com Tabs */}
      <section className="px-6 pb-12 bg-gradient-to-br from-background via-accent/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="processos">Processos</TabsTrigger>
              <TabsTrigger value="riscos-controles">Riscos & Controles</TabsTrigger>
              <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
            </TabsList>

            {/* Tab: Processos */}
            <TabsContent value="processos">
              <ProcessMapping selectedProjectId={irbProjectId} />
            </TabsContent>

            {/* Tab: Riscos & Controles */}
            <TabsContent value="riscos-controles" className="space-y-6">
              <RiskMatrix selectedProjectId={irbProjectId} />
            </TabsContent>

            {/* Tab: Frameworks */}
            <TabsContent value="frameworks">
              <COSOIntegratedFramework />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default ProjetosIRBControlesInternos;