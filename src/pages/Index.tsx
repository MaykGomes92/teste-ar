
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TabNavigation from "@/components/dashboard/TabNavigation";
import { useProjectData } from "@/hooks/useProjectData";

interface IndexProps {
  onHomeClick?: () => void;
  selectedProject?: any;
}

const Index = ({ onHomeClick, selectedProject }: IndexProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProcessId, setSelectedProcessId] = useState<string | undefined>();
  const { logProjectChange } = useProjectData(selectedProject?.id);

  const handleProcessClick = (processId: string) => {
    setSelectedProcessId(processId);
    setActiveTab("processes");
  };

  const handleCadastroSelect = (cadastro: string) => {
    setActiveTab(cadastro);
  };

  // Log quando um projeto é acessado
  useEffect(() => {
    if (selectedProject) {
      logProjectChange(
        'acesso',
        `Usuário acessou o projeto: ${selectedProject.nome_projeto}`,
        null,
        { projeto_id: selectedProject.id, projeto_nome: selectedProject.nome_projeto }
      );
    }
  }, [selectedProject, logProjectChange]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onHomeClick={onHomeClick} 
        onCadastroSelect={handleCadastroSelect}
        selectedProject={selectedProject}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedProcessId={selectedProcessId}
          setSelectedProcessId={setSelectedProcessId}
          onProcessClick={handleProcessClick}
          selectedProjectId={selectedProject?.id}
          selectedProject={selectedProject}
        />
      </div>
    </div>
  );
};

export default Index;
