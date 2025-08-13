import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, GitBranch, ClipboardList, Building2, FileText, BookOpen, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import KPICards from "./KPICards";
import DashboardCharts from "./DashboardCharts";
import ValueChain from "../ValueChain";
import DeliverableControl from "../DeliverableControl";
import COSOIntegratedFramework from "../COSOIntegratedFramework";
import CadastroInformacoesProjeto from "../cadastros/CadastroInformacoesProjeto";
import CadastroUsuarios from "../cadastros/CadastroUsuarios";
import CadastroCadeiaValor from "../cadastros/CadastroCadeiaValor";
import CadastroEntregaveis from "../cadastros/CadastroEntregaveis";
import CadastroCronograma from "../cadastros/CadastroCronograma";
import CadastroColunasRiscos from "../cadastros/CadastroColunasRiscos";
import CadastroColunasControles from "../cadastros/CadastroColunasControles";
import DatabaseBackup from "../DatabaseBackup";
import CargaEmMassa from "../cadastros/CargaEmMassa";
import MobileTabSelector from "../MobileTabSelector";
import KRIReportsTabContent from "../reports/KRIReportsTabContent";
import NormasEProcedimentos from "../NormasEProcedimentos";
import ProjectGRCFramework from "../ProjectGRCFramework";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProcessId?: string;
  setSelectedProcessId?: (processId: string | undefined) => void;
  onProcessClick?: (processId: string) => void;
  selectedProjectId?: string;
  selectedProject?: any;
}

const TabNavigation = ({ 
  activeTab, 
  setActiveTab, 
  selectedProcessId, 
  setSelectedProcessId, 
  onProcessClick,
  selectedProjectId,
  selectedProject
}: TabNavigationProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const isCadastroTab = ["informacoes-projeto", "usuarios", "cadeia", "entregaveis", "cronograma", "carga", "riscos", "controles", "backup"].includes(activeTab);
  
  // Tratamento especial para abas específicas
  if (activeTab === "normas-procedimentos") {
    return <NormasEProcedimentos selectedProjectId={selectedProjectId} />;
  }
  
  if (activeTab === "grc-framework") {
    return (
      <ProjectGRCFramework 
        selectedProject={selectedProject}
        onBackClick={() => setActiveTab("dashboard")}
      />
    );
  }

  const handleProcessClick = (processId: string) => {
    setSelectedProcessId?.(processId);
    setActiveTab("coso-framework");
    onProcessClick?.(processId);
  };

  const handleScheduleClick = () => {
    setActiveTab("deliverables");
  };

  const handleKPINavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const handleReportsClick = () => {
    navigate('/relatorios-kri');
  };

  if (isCadastroTab) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Cadastros</h2>
          <p className="text-slate-600">Configure os dados básicos necessários para a equipe e projetos</p>
        </div>
        
        {activeTab === "informacoes-projeto" && <CadastroInformacoesProjeto selectedProjectId={selectedProjectId} />}
        {activeTab === "usuarios" && <CadastroUsuarios selectedProjectId={selectedProjectId} />}
        {activeTab === "cadeia" && <CadastroCadeiaValor />}
        {activeTab === "entregaveis" && <CadastroEntregaveis />}
        {activeTab === "cronograma" && <CadastroCronograma />}
        {activeTab === "carga" && <CargaEmMassa />}
        {activeTab === "riscos" && <CadastroColunasRiscos />}
        {activeTab === "controles" && <CadastroColunasControles />}
        {activeTab === "backup" && <DatabaseBackup />}
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4'} bg-white shadow-lg rounded-lg p-1 flex-1`}>
          <TabsTrigger value="dashboard" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
            <Activity className="w-4 h-4" />
            {isMobile ? 'Dash' : 'Dashboard'}
          </TabsTrigger>
          <TabsTrigger value="deliverables" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
            <ClipboardList className="w-4 h-4" />
            {isMobile ? 'Entreg' : 'Entregas'}
          </TabsTrigger>
          <TabsTrigger value="valuechain" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
            <GitBranch className="w-4 h-4" />
            {isMobile ? 'Cadeia' : 'Cadeia de Valor'}
          </TabsTrigger>
          <TabsTrigger value="coso-framework" className={`flex items-center gap-2 ${isMobile ? 'text-xs px-2' : ''}`}>
            <Building2 className="w-4 h-4" />
            {isMobile ? 'COSO' : 'Framework COSO'}
          </TabsTrigger>
        </TabsList>
        
        {/* External Action Buttons */}
        <div className="flex items-center gap-2">
          <div 
            onClick={handleReportsClick}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer rounded-md shadow-sm ${isMobile ? 'text-xs px-3 py-1.5' : ''}`}
          >
            <FileText className="w-4 h-4" />
            {isMobile ? 'Relat' : 'Relatórios'}
          </div>
          
          <div 
            onClick={() => setActiveTab('normas-procedimentos')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground transition-all hover:bg-secondary/90 cursor-pointer rounded-md shadow-sm ${isMobile ? 'text-xs px-3 py-1.5' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            {isMobile ? 'Normas' : 'Normas e Procedimentos'}
          </div>
          
          <div 
            onClick={() => setActiveTab('grc-framework')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-accent-foreground transition-all hover:bg-accent/90 cursor-pointer rounded-md shadow-sm ${isMobile ? 'text-xs px-3 py-1.5' : ''}`}
          >
            <Shield className="w-4 h-4" />
            {isMobile ? 'GRC' : 'Framework GRC'}
          </div>
        </div>
      </div>

      {isMobile && (
        <MobileTabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <TabsContent value="dashboard" className="space-y-6">
        <KPICards onNavigate={handleKPINavigate} selectedProjectId={selectedProjectId} />
        <DashboardCharts selectedProjectId={selectedProjectId} />
      </TabsContent>

      <TabsContent value="deliverables">
        <DeliverableControl 
          onProcessClick={handleProcessClick}
          onScheduleClick={handleScheduleClick}
        />
      </TabsContent>

      <TabsContent value="valuechain">
        <ValueChain onProcessClick={handleProcessClick} selectedProjectId={selectedProjectId} />
      </TabsContent>

      <TabsContent value="coso-framework">
        <COSOIntegratedFramework />
      </TabsContent>

    </Tabs>
  );
};

export default TabNavigation;