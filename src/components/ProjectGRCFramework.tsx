import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Home
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectGRCFrameworkProps {
  selectedProject: any;
  onBackClick: () => void;
}

const ProjectGRCFramework = ({ selectedProject, onBackClick }: ProjectGRCFrameworkProps) => {
  const grcSteps = [
    {
      id: 1,
      title: "Mapeamento de Escopo & Objetivos",
      description: "Definição dos objetivos de GRC, escopo e principais áreas de risco",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      framework: "COSO / ISO 31000",
      status: "foundation"
    },
    {
      id: 2,
      title: "Identificação de Riscos & Controles",
      description: "Levantamento de riscos, vulnerabilidades e controles existentes",
      icon: Search,
      color: "from-purple-500 to-purple-600",
      framework: "COSO ERM",
      status: "identification"
    },
    {
      id: 3,
      title: "Avaliação de Riscos",
      description: "Implementação de avaliações qualitativas e quantitativas",
      icon: BarChart3,
      color: "from-orange-500 to-orange-600",
      framework: "ISO 31000",
      status: "assessment"
    },
    {
      id: 4,
      title: "Mapeamento de Controles",
      description: "Estruturação e mapeamento de controles internos",
      icon: Shield,
      color: "from-green-500 to-green-600",
      framework: "COSO IC",
      status: "mapping"
    },
    {
      id: 5,
      title: "Planejamento de Ações Corretivas",
      description: "Definição de planos de ação e melhorias",
      icon: Settings,
      color: "from-red-500 to-red-600",
      framework: "Three Lines of Defense",
      status: "planning"
    },
    {
      id: 6,
      title: "Implementação de Controles/Ações",
      description: "Execução dos controles e ações planejadas",
      icon: CheckCircle,
      color: "from-indigo-500 to-indigo-600",
      framework: "ISO 37301",
      status: "implementation"
    },
    {
      id: 7,
      title: "Monitoramento Contínuo",
      description: "Dashboards, KPIs/KRIs, auditorias internas e testes",
      icon: Activity,
      color: "from-cyan-500 to-cyan-600",
      framework: "COBIT / ITGC",
      status: "monitoring"
    },
    {
      id: 8,
      title: "Análise de Resultados & Feedback",
      description: "Avaliação de efetividade e feedback contínuo",
      icon: TrendingUp,
      color: "from-pink-500 to-pink-600",
      framework: "PDCA",
      status: "analysis"
    }
  ];

  const estruturaBase = [
    { nome: "Cadeia de Valor", icon: GitBranch, action: "value-chain" },
    { nome: "Macro Processos", icon: Building2, action: "macro-processes" },
    { nome: "Processos", icon: Settings, action: "processes" },
    { nome: "Riscos", icon: AlertTriangle, action: "risks" },
    { nome: "Controles", icon: Shield, action: "controls" },
    { nome: "KRIs", icon: BarChart3, action: "kris" },
    { nome: "Melhorias", icon: TrendingUp, action: "improvements" },
    { nome: "Testes", icon: CheckCircle, action: "tests" }
  ];

  const handleStructureClick = (action: string) => {
    // Aqui você pode implementar navegação específica para cada área do projeto
    console.log(`Navegando para ${action} no projeto ${selectedProject?.nome_projeto}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackClick} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Voltar ao Projeto
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <h1 className="text-2xl font-bold text-gray-900">Framework GRC</h1>
            <Badge variant="secondary" className="ml-2">{selectedProject?.nome_projeto}</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Framework Completo de
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> GRC</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Aplicando o programa integrado de <strong>Governança, Riscos e Compliance</strong> ao projeto{" "}
            <strong>{selectedProject?.nome_projeto}</strong>
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-sm px-4 py-2">COSO Framework</Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">ISO 31000</Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">ISO 37301</Badge>
          </div>
        </div>

        {/* Estrutura Base do Projeto */}
        <Card className="border-2 border-primary/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-8 h-8 text-primary" />
              Estrutura Base - {selectedProject?.cliente}
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Componentes fundamentais do projeto com referências automáticas entre elementos
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {estruturaBase.map((item, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  onClick={() => handleStructureClick(item.action)}
                  className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover-scale transition-all duration-300"
                >
                  <item.icon className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium">{item.nome}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fluxo GRC para o Projeto */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Repeat className="w-8 h-8 text-primary" />
              Fluxo Integrado de GRC - {selectedProject?.nome_projeto}
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Ciclo completo de Governança, Riscos e Compliance aplicado ao seu projeto
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {grcSteps.map((step, index) => (
              <div key={step.id} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Step Icon and Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center shadow-xl hover-scale`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center mt-3">
                      <Badge variant="secondary" className="text-sm font-bold">
                        Etapa {step.id}
                      </Badge>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      <Badge variant="outline" className="text-sm mt-2 md:mt-0 w-fit px-3 py-1">
                        {step.framework}
                      </Badge>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>
                  </div>
                </div>

                {/* Arrow to next step */}
                {index < grcSteps.length - 1 && (
                  <div className="flex justify-center my-8">
                    <ArrowDown className="w-8 h-8 text-gray-400 animate-bounce" />
                  </div>
                )}
              </div>
            ))}

            {/* Continuous Improvement Loop */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-center gap-6 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl hover-scale">
                <Repeat className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900">Melhoria Contínua</h4>
                  <p className="text-gray-600">Ciclo de feedback contínuo para otimização do projeto</p>
                </div>
                <ArrowRight className="w-8 h-8 text-gray-400" />
                <span className="text-lg font-medium text-primary">Reinício do Ciclo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metodologias */}
        <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Metodologias e Frameworks Aplicados</CardTitle>
            <p className="text-gray-600">Implementação das melhores práticas internacionais no seu projeto</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-white rounded-lg shadow-sm hover-scale">
                <h4 className="font-bold text-lg text-gray-900">COSO</h4>
                <p className="text-sm text-gray-600 mt-1">Enterprise Risk Management</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm hover-scale">
                <h4 className="font-bold text-lg text-gray-900">ISO 31000</h4>
                <p className="text-sm text-gray-600 mt-1">Risk Management</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm hover-scale">
                <h4 className="font-bold text-lg text-gray-900">ISO 37301</h4>
                <p className="text-sm text-gray-600 mt-1">Compliance Management</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm hover-scale">
                <h4 className="font-bold text-lg text-gray-900">COBIT</h4>
                <p className="text-sm text-gray-600 mt-1">IT Governance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectGRCFramework;