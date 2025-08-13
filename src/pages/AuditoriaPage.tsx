import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import AuditFramework from "@/components/audit/AuditFramework";
import { useProjectData } from "@/hooks/useProjectData";
import NextGenHeader from '@/components/NextGenHeader';

interface AuditoriaPageProps {
  onHomeClick?: () => void;
  selectedProject?: any;
}

const AuditoriaPage = ({ onHomeClick, selectedProject }: AuditoriaPageProps) => {
  const { logProjectChange } = useProjectData(selectedProject?.id);

  // Log quando a página de auditoria é acessada
  useEffect(() => {
    if (selectedProject) {
      logProjectChange(
        'acesso',
        `Usuário acessou o módulo de Auditoria do projeto: ${selectedProject.nome_projeto}`,
        null,
        { 
          projeto_id: selectedProject.id, 
          projeto_nome: selectedProject.nome_projeto,
          modulo: 'auditoria'
        }
      );
    }
  }, [selectedProject, logProjectChange]);

  return (
    <div className="min-h-screen bg-background">
      <NextGenHeader 
        title="Auditoria Interna"
        subtitle="Testes de efetividade, cronogramas e planos de ação"
        badges={{
          cliente: selectedProject?.cliente || 'Empresa ABC',
          progresso: `${selectedProject?.progresso_percentual || 0}%`,
          status: selectedProject?.status_projeto || 'Em Andamento'
        }}
        showBackButton={true}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AuditFramework
          selectedProjectId={selectedProject?.id}
          selectedProject={selectedProject}
        />
      </div>
    </div>
  );
};

export default AuditoriaPage;