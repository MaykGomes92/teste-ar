import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Calendar, Users, Settings, Copy, UserCog, 
  ArrowRight, Target, Shield, FileText, BarChart3, 
  CheckCircle, Activity, TrendingUp, AlertTriangle,
  GitBranch, Network, Workflow, Eye, ClipboardCheck,
  Building, Map, Layers, Route, Zap
} from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import WaveLoading from "@/components/ui/wave-loading";

// Mock data para sponsors - em um projeto real, isso viria do cadastro de usuários

interface ProjectInfo {
  id: string;
  nome_projeto: string;
  cliente: string;
  data_inicio: string;
  data_fim: string;
  sponsor_principal?: string;
  objetivo_projeto: string;
  created_at: string;
  updated_at: string;
}

const ProjectsListPage = ({ onProjectSelect }: { onProjectSelect: (project: any) => void }) => {
  const { toast } = useToast();
  const location = useLocation();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateProject, setTemplateProject] = useState<ProjectInfo | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  
  // Form state for new project
  const [newProjectForm, setNewProjectForm] = useState({
    nomeProjeto: "",
    cliente: "",
    dataInicio: "",
    dataFim: "",
    sponsorPrincipal: "none",
    objetivoProjeto: ""
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('🚀 Iniciando carregamento de projetos...');
        console.log('Environment:', {
          hostname: window.location.hostname,
          origin: window.location.origin,
          pathname: window.location.pathname
        });

        // Verificar autenticação primeiro
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('👤 Status de autenticação:', { 
          isAuthenticated: !!user, 
          userEmail: user?.email,
          authError: authError?.message 
        });

        if (authError) {
          console.error('❌ Erro de autenticação:', authError);
          toast({
            title: "Erro de autenticação",
            description: "Problema ao verificar autenticação. Tente fazer login novamente.",
            variant: "destructive"
          });
          return;
        }

        if (!user) {
          console.warn('⚠️ Usuário não autenticado');
          return;
        }

        const { data, error } = await supabase
          .from('project_info')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('📊 Resultado da query:', { 
          data: data?.length, 
          error: error?.message,
          details: error 
        });

        if (error) {
          console.error('Erro ao carregar projetos:', error);
          toast({
            title: "Erro ao carregar projetos",
            description: `${error.message}. Verifique sua conexão e tente novamente.`,
            variant: "destructive"
          });
          return;
        }

        // Filtrar projetos - remover projeto exemplo que agora está na demo
        const filteredProjects = (data || []).filter(p => p.id !== 'c0a80000-0000-4000-8000-000000000001');
        setProjects(filteredProjects);
        
        // Identificar projeto template
        const template = filteredProjects.find(p => p.cliente?.includes('Empresa ABC'));
        if (template) {
          setTemplateProject(template);
        }

        // Auto-selecionar projeto se passado via state
        const selectedProjectId = location.state?.selectedProjectId;
        if (selectedProjectId && data) {
          const targetProject = data.find(p => p.id === selectedProjectId);
          if (targetProject) {
            onProjectSelect(targetProject);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();

    // Configurar listener para mudanças em tempo real
    const channel = supabase
      .channel('project_info_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_info'
        },
        (payload) => {
          console.log('Mudança detectada:', payload);
          // Recarregar projetos quando houver mudanças
          loadProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [location, onProjectSelect]);

  const handleNewProjectFormChange = (field: string, value: string) => {
    setNewProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetNewProjectForm = () => {
    setNewProjectForm({
      nomeProjeto: "",
      cliente: "",
      dataInicio: "",
      dataFim: "",
      sponsorPrincipal: "none",
      objetivoProjeto: ""
    });
  };

  const createNewProject = async () => {
    toast({
      title: "Funcionalidade não disponível",
      description: "Criação de projetos temporariamente desabilitada para acesso público.",
      variant: "destructive"
    });
  };

  const getSponsorName = (sponsor?: string) => {
    return sponsor || "Não informado";
  };

  const handleDialogOpen = () => {
    resetNewProjectForm();
    setUseTemplate(false);
    setIsDialogOpen(true);
  };

  // Framework de GRC - dados das etapas
  const grcFrameworkSteps = [
    {
      id: 1,
      title: "Mapeamento de Escopo & Objetivos",
      subtitle: "Definição estratégica do framework GRC",
      description: "Estabelecer objetivos, escopo e principais áreas de foco do programa de GRC",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      items: [
        { name: "Cadeia de Valor", link: "/cadastros", icon: GitBranch },
        { name: "Macro Processos", link: "/cadastros", icon: Layers },
        { name: "Definição de Escopo", link: "/cadastros", icon: Map }
      ],
      methodology: "COSO Framework - Strategic Planning"
    },
    {
      id: 2,
      title: "Identificação de Riscos & Controles",
      subtitle: "Mapeamento completo do universo de riscos",
      description: "Catalogar riscos, vulnerabilidades e controles existentes na organização",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500",
      items: [
        { name: "Processos", link: "/processo-management", icon: Route },
        { name: "Riscos", link: "/processo-management", icon: AlertTriangle },
        { name: "Controles (KRIs)", link: "/processo-management", icon: Shield }
      ],
      methodology: "ISO 31000 - Risk Management"
    },
    {
      id: 3,
      title: "Avaliação de Riscos",
      subtitle: "Análise qualitativa e quantitativa",
      description: "Implementar avaliações de impacto, probabilidade e matrizes de risco",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
      items: [
        { name: "Matriz de Riscos", link: "/processo-management", icon: BarChart3 },
        { name: "Relatórios KRI", link: "/kri-reports", icon: FileText },
        { name: "Análise de Impacto", link: "/processo-management", icon: TrendingUp }
      ],
      methodology: "COSO ERM - Risk Assessment"
    },
    {
      id: 4,
      title: "Mapeamento de Controles",
      subtitle: "Design e estruturação de controles",
      description: "Estabelecer controles preventivos, detectivos e corretivos",
      icon: Shield,
      color: "from-green-500 to-green-600",
      items: [
        { name: "Controles Internos", link: "/processo-management", icon: Shield },
        { name: "Testes de Efetividade", link: "/grc-nextgen-auditoria", icon: ClipboardCheck },
        { name: "Melhorias", link: "/processo-management", icon: TrendingUp }
      ],
      methodology: "COSO Internal Control Framework"
    },
    {
      id: 5,
      title: "Planejamento de Ações Corretivas",
      subtitle: "Definição de planos de ação",
      description: "Desenvolver estratégias para mitigação de riscos e melhorias",
      icon: CheckCircle,
      color: "from-teal-500 to-teal-600",
      items: [
        { name: "Planos de Ação", link: "/grc-nextgen-auditoria", icon: CheckCircle },
        { name: "Cronograma", link: "/cadastros", icon: Calendar },
        { name: "Responsabilidades", link: "/cadastros", icon: Users }
      ],
      methodology: "Three Lines of Defense Model"
    },
    {
      id: 6,
      title: "Implementação de Controles",
      subtitle: "Execução e automação",
      description: "Colocar em prática os controles definidos e automatizar processos",
      icon: Zap,
      color: "from-indigo-500 to-indigo-600",
      items: [
        { name: "Execução de Testes", link: "/grc-nextgen-auditoria", icon: Activity },
        { name: "Automação", link: "/grc-nextgen-auditoria", icon: Zap },
        { name: "Validações", link: "/grc-nextgen-auditoria", icon: CheckCircle }
      ],
      methodology: "COBIT - Implementation"
    },
    {
      id: 7,
      title: "Monitoramento Contínuo",
      subtitle: "Supervisão e acompanhamento",
      description: "Utilizar dashboards, KPIs/KRIs e indicadores de performance",
      icon: Activity,
      color: "from-cyan-500 to-cyan-600",
      items: [
        { name: "Dashboard Executivo", link: "/", icon: BarChart3 },
        { name: "KRIs em Tempo Real", link: "/kri-reports", icon: Activity },
        { name: "Alertas Automáticos", link: "/", icon: AlertTriangle }
      ],
      methodology: "ISO 37301 - Compliance Monitoring"
    },
    {
      id: 8,
      title: "Análise & Melhoria Contínua",
      subtitle: "Ciclo de feedback e otimização",
      description: "Revisar resultados, auditorias e implementar melhorias sistemáticas",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      items: [
        { name: "Análise de Performance", link: "/kri-reports", icon: BarChart3 },
        { name: "Auditoria & Revisão", link: "/grc-nextgen-auditoria", icon: Eye },
        { name: "Feedback Loop", link: "/", icon: TrendingUp }
      ],
      methodology: "Continuous Improvement - Kaizen"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <WaveLoading size="lg" text="Carregando sistema GRC..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section com gradient da Orla Consultoria */}
      <section className="bg-gradient-to-br from-orla-teal via-orla-teal-dark to-orla-blue-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Conteúdo principal */}
            <div className="space-y-4 flex-1">
              {/* Badge */}
              <div className="inline-block">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                  GRC NextGen Suite - Demo
                </Badge>
              </div>
              
              {/* Título principal */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                <span className="text-white">Empresa ABC</span><br />
                <span className="text-white/90">Framework Executivo GRC</span>
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                Sistema integrado de Governança, Risco e Compliance baseado em metodologias 
                internacionais para gestão completa do ambiente de controles internos.
              </p>
              
              {/* Badges de metodologias */}
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-white/15 text-white border-white/30 px-3 py-1">COSO Framework</Badge>
                <Badge className="bg-white/15 text-white border-white/30 px-3 py-1">ISO 31000</Badge>
                <Badge className="bg-white/15 text-white border-white/30 px-3 py-1">ISO 37301</Badge>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Módulos do Sistema
            </h2>
            <p className="text-xl text-muted-foreground">
              Acesse os diferentes módulos da plataforma GRC
            </p>
          </div>
          {/* Cards de Acesso */}
          <div className="grid md:grid-cols-4 gap-6">
            {/* Dashboard & Cadeia de Valor */}
            <Link to="/grc-nextgen-suite-cadeiadevalor">
              <Card className="border border-orla-teal/20 hover:border-orla-teal hover:shadow-hover transition-all duration-300 cursor-pointer group h-80 bg-white">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orla-teal to-orla-teal-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Dashboard & Cadeia de Valor</h3>
                  <p className="text-muted-foreground text-sm">
                    Dashboard geral e criação/edição da cadeia de valor - início de toda criação de processos
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Controles Internos */}
            <Link to="/grc-nextgen-ctrl-intern">
              <Card className="border border-orla-green/20 hover:border-orla-green hover:shadow-hover transition-all duration-300 cursor-pointer group h-80 bg-white">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orla-green to-orla-green-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Controles Internos</h3>
                  <p className="text-muted-foreground text-sm">
                    Sistema completo para gestão de processos, riscos, controles e KRIs
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Auditoria */}
            <Link to="/grc-nextgen-auditoria">
              <Card className="border border-orla-blue/20 hover:border-orla-blue hover:shadow-hover transition-all duration-300 cursor-pointer group h-80 bg-white">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orla-blue to-orla-blue-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ClipboardCheck className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Auditoria</h3>
                  <p className="text-muted-foreground text-sm">
                    Módulo de auditoria interna, testes de efetividade e planos de ação
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Cadastros */}
            <Link to="/cadastros">
              <Card className="border border-orla-gray/20 hover:border-orla-gray hover:shadow-hover transition-all duration-300 cursor-pointer group h-80 bg-white">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orla-gray to-orla-gray-dark rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Cadastros</h3>
                  <p className="text-muted-foreground text-sm">
                    Estrutura organizacional e configurações do sistema
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsListPage;