import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Search, 
  Shield, 
  BarChart3, 
  Settings, 
  Activity, 
  FileText, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Building2,
  AlertTriangle,
  Eye,
  Repeat,
  Home,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

interface GRCPageProps {
  onHomeClick?: () => void;
}

const GRCPage = ({ onHomeClick }: GRCPageProps) => {
  const grcSteps = [
    {
      id: 1,
      title: "Mapeamento de Escopo & Objetivos",
      description: "Definição dos objetivos de GRC, escopo e principais áreas de risco",
      icon: Target,
      color: "from-orla-teal-dark to-orla-teal",
      framework: "COSO / ISO 31000",
      status: "foundation"
    },
    {
      id: 2,
      title: "Identificação de Riscos & Controles",
      description: "Levantamento de riscos, vulnerabilidades e controles existentes",
      icon: Search,
      color: "from-orla-teal to-orla-teal-light",
      framework: "COSO ERM",
      status: "identification"
    },
    {
      id: 3,
      title: "Avaliação de Riscos",
      description: "Implementação de avaliações qualitativas e quantitativas",
      icon: BarChart3,
      color: "from-orla-blue-dark to-orla-blue",
      framework: "ISO 31000",
      status: "assessment"
    },
    {
      id: 4,
      title: "Mapeamento de Controles",
      description: "Estruturação e mapeamento de controles internos",
      icon: Shield,
      color: "from-orla-green-dark to-orla-green",
      framework: "COSO IC",
      status: "mapping"
    },
    {
      id: 5,
      title: "Planejamento de Ações Corretivas",
      description: "Definição de planos de ação e melhorias",
      icon: Settings,
      color: "from-orla-blue to-orla-blue-light",
      framework: "Three Lines of Defense",
      status: "planning"
    },
    {
      id: 6,
      title: "Implementação de Controles/Ações",
      description: "Execução dos controles e ações planejadas",
      icon: CheckCircle,
      color: "from-orla-teal-light to-orla-green-light",
      framework: "ISO 37301",
      status: "implementation"
    },
    {
      id: 7,
      title: "Monitoramento Contínuo",
      description: "Dashboards, KPIs/KRIs, auditorias internas e testes",
      icon: Activity,
      color: "from-orla-green to-orla-green-light",
      framework: "COBIT / ITGC",
      status: "monitoring"
    },
    {
      id: 8,
      title: "Análise de Resultados & Feedback",
      description: "Avaliação de efetividade e feedback contínuo",
      icon: TrendingUp,
      color: "from-success to-orla-green",
      framework: "PDCA",
      status: "analysis"
    }
  ];

  const acessoRapido = [
    { 
      nome: "Cadeia de Valor", 
      icon: GitBranch, 
      link: "/cadastro",
      descricao: "Mapeamento completo da cadeia de valor organizacional",
      color: "from-orla-blue-dark to-orla-blue"
    },
    { 
      nome: "Processos & Riscos", 
      icon: AlertTriangle, 
      link: "/auth",
      descricao: "Gestão integrada de processos e matriz de riscos",
      color: "from-orla-teal to-orla-teal-light"
    },
    { 
      nome: "Auditoria", 
      icon: CheckCircle, 
      link: "/grc-nextgen-auditoria",
      descricao: "Módulo de auditoria com cronograma e planos de ação",
      color: "from-orla-green-dark to-orla-green"
    },
    { 
      nome: "Dashboard Executivo", 
      icon: BarChart3, 
      link: "/auth",
      descricao: "Indicadores e métricas executivas em tempo real",
      color: "from-orla-teal-dark to-orla-teal"
    },
    { 
      nome: "Cadastros e Administração", 
      icon: Settings, 
      link: "/cadastro",
      descricao: "Configurações do sistema e cadastros base",
      color: "from-orla-gray-dark to-orla-gray"
    }
  ];

  const projetos = [
    {
      nome: "Mapeamento de Controles",
      descricao: "Projeto completo de mapeamento de processos e controles internos",
      icon: FileText,
      link: "/auth",
      color: "from-orla-green-dark to-orla-green"
    },
    {
      nome: "Auditoria",
      descricao: "Módulo de auditoria com cronograma, testes e planos de ação",
      icon: Eye,
      link: "/grc-nextgen-auditoria",
      color: "from-orla-teal-dark to-orla-teal"
    }
  ];

  return (
    <div className="min-h-screen">
      <GlobalHeader />
      {/* Header Section com background gradient */}
      <section className="bg-gradient-to-br from-orla-teal via-orla-teal-dark to-orla-blue-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Conteúdo à esquerda */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-block">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                  GRC NextGen Suite
                </Badge>
              </div>
              
              {/* Título principal */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                <span className="text-white">Governança, Riscos</span><br />
                <span className="text-white">e Compliance</span>
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg text-white/90 leading-relaxed">
                Plataforma completa para gestão de GRC com metodologias internacionais
              </p>
              
              {/* Botões */}
              <div className="flex gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  className="bg-white text-orla-teal-dark hover:bg-gray-50 font-semibold shadow-lg"
                  onClick={() => window.location.href = '/grc-audit-demo'}
                >
                  Iniciar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-orla-teal text-white hover:bg-orla-teal-dark border-0 shadow-lg"
                >
                  Documentação
                </Button>
              </div>
            </div>
            
            {/* Dashboard mockup à direita */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Dashboard GRC</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Risk Level Indicator */}
                  <div className="bg-white/15 rounded-lg p-4">
                    <div className="text-xs text-white/80 font-semibold mb-2">NÍVEL DE RISCO</div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16">
                        <div className="w-16 h-16 rounded-full border-4 border-white/20"></div>
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent border-r-transparent transform -rotate-45"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">72%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-yellow-400">MÉDIO</div>
                        <div className="text-xs text-white/70">12 riscos ativos</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compliance Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/15 rounded-lg p-3">
                      <div className="text-xs text-white/80 font-semibold mb-1">COMPLIANCE</div>
                      <div className="text-lg font-bold text-emerald-400">94%</div>
                      <div className="flex items-center gap-1">
                        <div className="bg-emerald-400 h-1 w-8 rounded"></div>
                        <span className="text-xs text-emerald-400">↑ +3%</span>
                      </div>
                    </div>
                    <div className="bg-white/15 rounded-lg p-3">
                      <div className="text-xs text-white/80 font-semibold mb-1">CONTROLES</div>
                      <div className="text-lg font-bold text-blue-400">87%</div>
                      <div className="flex items-center gap-1">
                        <div className="bg-blue-400 h-1 w-6 rounded"></div>
                        <span className="text-xs text-blue-400">↑ +1%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Categories Chart */}
                  <div className="bg-white/15 rounded-lg p-4">
                    <div className="text-xs text-white/80 font-semibold mb-3">CATEGORIAS DE RISCO</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">Operacional</span>
                        <div className="flex items-center gap-2">
                          <div className="bg-red-400 h-2 w-12 rounded"></div>
                          <span className="text-xs text-red-400 font-bold">Alto</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">Financeiro</span>
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-400 h-2 w-8 rounded"></div>
                          <span className="text-xs text-yellow-400 font-bold">Médio</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70">Regulatório</span>
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-400 h-2 w-10 rounded"></div>
                          <span className="text-xs text-emerald-400 font-bold">Baixo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Framework Indicators */}
                  <div className="flex justify-between text-xs">
                    <div className="text-center">
                      <div className="w-8 h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center mb-1">
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-white/70">COSO</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center mb-1">
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-white/70">ISO 31000</span>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center mb-1">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-white/70">ISO 37301</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fluxo Integrado de GRC */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fluxo Integrado de GRC
            </h2>
            <p className="text-xl text-gray-600">
              Ciclo completo de Governança, Riscos e Compliance com metodologias internacionais
            </p>
          </div>

          {/* Grid de etapas */}
          <div className="grid md:grid-cols-4 gap-6">
            {grcSteps.map((step, index) => (
              <Card key={step.id} className="bg-white hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-bold mb-2">
                    Etapa {step.id}
                  </Badge>
                  <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="outline" className="text-xs mb-3 px-2 py-1">
                    {step.framework}
                  </Badge>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Melhoria Contínua */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-6">
                  <Repeat className="w-12 h-12 text-primary" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Melhoria Contínua</h4>
                    <p className="text-gray-600">Ciclo de feedback contínuo para otimização</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Acesso Rápido */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Acesso Rápido
            </h2>
            <p className="text-gray-600 text-lg">
              Navegue pelos principais módulos do framework GRC
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-2">
            {acessoRapido.map((item, index) => (
              <Link key={index} to={item.link}>
                <Card className="h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="text-center p-2 flex flex-col items-center justify-center min-h-[100px]">
                    <div className={`w-6 h-6 bg-gradient-to-br ${item.color} rounded-md mb-1.5 flex items-center justify-center shadow-sm`}>
                      <item.icon className="w-3 h-3 text-white" />
                    </div>
                    <h3 className="text-[10px] font-bold text-gray-900 leading-tight mb-0.5 text-center">
                      {item.nome}
                    </h3>
                    <p className="text-gray-600 text-[8px] leading-tight text-center">
                      {item.descricao}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Metodologias */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Metodologias e Frameworks Suportados</CardTitle>
              <p className="text-gray-600">Baseado nas melhores práticas internacionais</p>
              
              {/* Botão Ver Detalhes */}
              <div className="flex justify-center mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-primary hover:bg-primary hover:text-white transition-colors">
                      <Info className="w-4 h-4 mr-2" />
                      Ver detalhes das metodologias
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Metodologias e Frameworks de GRC</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="coso">COSO</TabsTrigger>
                        <TabsTrigger value="iso31000">ISO 31000</TabsTrigger>
                        <TabsTrigger value="iso37301">ISO 37301</TabsTrigger>
                        <TabsTrigger value="cobit">COBIT</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview" className="space-y-4">
                        <h3 className="text-lg font-semibold">Framework Integrado de GRC</h3>
                        <p className="text-muted-foreground">
                          Nosso framework combina as melhores práticas das principais metodologias internacionais 
                          para criar uma abordagem integrada de Governança, Riscos e Compliance.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Benefícios da Integração</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Visão holística dos riscos organizacionais</li>
                              <li>• Redução de redundâncias e silos</li>
                              <li>• Melhoria na tomada de decisões</li>
                              <li>• Otimização de recursos e custos</li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Aplicação Prática</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Mapeamento de processos e controles</li>
                              <li>• Avaliação e monitoramento de riscos</li>
                              <li>• Auditoria e testes de efetividade</li>
                              <li>• Planos de ação e melhoria contínua</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="coso" className="space-y-4">
                        <h3 className="text-lg font-semibold">COSO - Committee of Sponsoring Organizations</h3>
                        <p className="text-muted-foreground">
                          Framework líder mundial para Enterprise Risk Management (ERM) e controles internos.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Cinco Componentes do COSO</h4>
                            <div className="grid gap-2">
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">1. Ambiente de Controle</h5>
                                <p className="text-sm text-muted-foreground">Cultura organizacional e tom da liderança</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">2. Avaliação de Riscos</h5>
                                <p className="text-sm text-muted-foreground">Identificação e análise de riscos aos objetivos</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">3. Atividades de Controle</h5>
                                <p className="text-sm text-muted-foreground">Políticas e procedimentos para mitigar riscos</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">4. Informação e Comunicação</h5>
                                <p className="text-sm text-muted-foreground">Captura e comunicação de informações relevantes</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">5. Monitoramento</h5>
                                <p className="text-sm text-muted-foreground">Avaliação contínua da efetividade dos controles</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="iso31000" className="space-y-4">
                        <h3 className="text-lg font-semibold">ISO 31000 - Gestão de Riscos</h3>
                        <p className="text-muted-foreground">
                          Padrão internacional que fornece princípios e diretrizes para gestão de riscos.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Princípios da ISO 31000</h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Criar e Proteger Valor</h5>
                                <p className="text-sm text-muted-foreground">A gestão de riscos deve agregar valor à organização</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Integrada</h5>
                                <p className="text-sm text-muted-foreground">Parte integral de todos os processos organizacionais</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Estruturada e Abrangente</h5>
                                <p className="text-sm text-muted-foreground">Abordagem sistemática e consistente</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Customizada</h5>
                                <p className="text-sm text-muted-foreground">Alinhada ao contexto da organização</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Processo de Gestão de Riscos</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">
                                Comunicação → Estabelecimento do Contexto → Identificação → Análise → 
                                Avaliação → Tratamento → Monitoramento e Análise Crítica
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="iso37301" className="space-y-4">
                        <h3 className="text-lg font-semibold">ISO 37301 - Sistemas de Gestão de Compliance</h3>
                        <p className="text-muted-foreground">
                          Padrão internacional para sistemas de gestão de compliance organizacional.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Elementos Principais</h4>
                            <div className="grid gap-2">
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Contexto da Organização</h5>
                                <p className="text-sm text-muted-foreground">Compreensão do ambiente interno e externo</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Liderança e Compromisso</h5>
                                <p className="text-sm text-muted-foreground">Demonstração do comprometimento da alta direção</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Planejamento</h5>
                                <p className="text-sm text-muted-foreground">Identificação de obrigações e riscos de compliance</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Operação</h5>
                                <p className="text-sm text-muted-foreground">Implementação de controles e processos</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="cobit" className="space-y-4">
                        <h3 className="text-lg font-semibold">COBIT - Control Objectives for IT</h3>
                        <p className="text-muted-foreground">
                          Framework para governança e gestão de TI empresarial.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Domínios do COBIT</h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Planejar e Organizar (PO)</h5>
                                <p className="text-sm text-muted-foreground">Estratégia de TI e arquitetura</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Adquirir e Implementar (AI)</h5>
                                <p className="text-sm text-muted-foreground">Soluções de TI e integração</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Entregar e Suportar (DS)</h5>
                                <p className="text-sm text-muted-foreground">Serviços e suporte aos usuários</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <h5 className="font-medium">Monitorar e Avaliar (ME)</h5>
                                <p className="text-sm text-muted-foreground">Desempenho e compliance</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg text-gray-900">COSO</h4>
                  <p className="text-sm text-gray-600 mt-1">Enterprise Risk Management</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg text-gray-900">ISO 31000</h4>
                  <p className="text-sm text-gray-600 mt-1">Risk Management</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg text-gray-900">ISO 37301</h4>
                  <p className="text-sm text-gray-600 mt-1">Compliance Management</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-lg text-gray-900">COBIT</h4>
                  <p className="text-sm text-gray-600 mt-1">IT Governance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navegação */}
      <section className="py-8 px-6 bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto flex justify-center gap-4">
          <Link to="/landing">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-orla-teal text-white hover:bg-orla-teal-dark border-orla-teal hover:text-white">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link to="/auth-cliente">
            <Button size="sm" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Acesse seu Sistema
            </Button>
          </Link>
        </div>
      </section>
      
      <GlobalFooter />
    </div>
  );
};

export default GRCPage;