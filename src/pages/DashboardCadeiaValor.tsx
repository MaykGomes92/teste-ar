import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Shield, BarChart3, Building, Layers, GitBranch, Plus, Eye, Settings, AlertTriangle, TestTube, TrendingUp, PenTool, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProjectData } from "@/hooks/useProjectData";
import ValueChain from "@/components/ValueChain";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import KPICards from "@/components/dashboard/KPICards";
import NextGenHeader from '@/components/NextGenHeader';

const DashboardCadeiaValor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const handleKPINavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const handleProcessClick = (processId: string) => {
    // Navegar para o módulo de processos
    toast({
      title: "Navegação",
      description: "Redirecionando para o módulo de processos...",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NextGenHeader 
        title="Dashboard & Cadeia de Valor"
        subtitle="Visão geral do projeto e gestão da cadeia de valor - início de toda criação de processos"
        badges={{
          cliente: projectInfo?.cliente || 'Empresa ABC',
          progresso: `${projectDetails?.progresso_percentual || 0}%`,
          status: projectDetails?.status_projeto || 'Em Andamento'
        }}
        homeLink="/grc-nextgen-suit-landing-demo"
        showHomeIcon={false}
        showBackButton={true}
      />

      {/* Conteúdo Principal */}
      <section className="px-6 py-8 bg-gradient-to-br from-background via-accent/5 to-primary/10">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-lg rounded-lg p-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard Geral
              </TabsTrigger>
              <TabsTrigger value="cadeia-valor" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Cadeia de Valor
              </TabsTrigger>
            </TabsList>

            {/* Tab: Dashboard Geral */}
            <TabsContent value="dashboard" className="space-y-6">
              
              {/* Dashboard de Métricas Detalhadas */}
              <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-4">
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

              {/* Gráficos e Análises */}
              <DashboardCharts selectedProjectId={irbProjectId} />

              {/* Navegação Rápida */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Navegação Rápida
                  </CardTitle>
                  <CardDescription>
                    Acesse rapidamente os principais módulos do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link to="/grc-nextgen-ctrl-intern">
                      <Card className="border-2 border-primary/20 hover:border-primary hover:shadow-md transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h3 className="font-semibold mb-2">Controles Internos</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Gestão de processos, riscos e controles
                          </p>
                          <div className="flex items-center justify-center text-primary font-medium">
                            Acessar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/grc-nextgen-auditoria">
                      <Card className="border-2 border-accent/20 hover:border-accent hover:shadow-md transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Eye className="w-8 h-8 text-accent mx-auto mb-3" />
                          <h3 className="font-semibold mb-2">Auditoria</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Testes de efetividade e planos de ação
                          </p>
                          <div className="flex items-center justify-center text-accent font-medium">
                            Acessar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/grc-nextgen-suite">
                      <Card className="border-2 border-purple/20 hover:border-purple hover:shadow-md transition-all duration-300 cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                          <h3 className="font-semibold mb-2">Sistema GRC</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Visão completa do framework GRC
                          </p>
                          <div className="flex items-center justify-center text-purple-600 font-medium">
                            Acessar
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Cadeia de Valor */}
            <TabsContent value="cadeia-valor">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Gestão da Cadeia de Valor
                  </CardTitle>
                  <CardDescription>
                    Configure e gerencie a cadeia de valor da organização - base para criação de processos, riscos e controles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ValueChain 
                    onProcessClick={handleProcessClick} 
                    selectedProjectId={irbProjectId} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default DashboardCadeiaValor;