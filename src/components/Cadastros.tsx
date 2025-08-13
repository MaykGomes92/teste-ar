
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Users, GitBranch, Package, Calendar, Settings, Upload, Database, Shield, AlertTriangle } from "lucide-react";
import CadastroUsuarios from "./cadastros/CadastroUsuarios";
import CadastroCadeiaValor from "./cadastros/CadastroCadeiaValor";
import CadastroEntregaveis from "./cadastros/CadastroEntregaveis";
import CadastroCronograma from "./cadastros/CadastroCronograma";
import CadastroColunasRiscos from "./cadastros/CadastroColunasRiscos";
import CadastroColunasControles from "./cadastros/CadastroColunasControles";
import CargaEmMassa from "./cadastros/CargaEmMassa";
import DatabaseBackup from "./DatabaseBackup";

const Cadastros = () => {
  const [activeSubTab, setActiveSubTab] = useState("usuarios");

  // Renderização do conteúdo baseado na seleção
  const renderContent = () => {
    switch (activeSubTab) {
      case "usuarios":
        return <CadastroUsuarios />;
      case "cadeia":
        return <CadastroCadeiaValor />;
      case "entregaveis":
        return <CadastroEntregaveis />;
      case "cronograma":
        return <CadastroCronograma />;
      case "riscos":
        return <CadastroColunasRiscos />;
      case "controles":
        return <CadastroColunasControles />;
      case "carga":
        return <CargaEmMassa />;
      case "backup":
        return <DatabaseBackup />;
      default:
        return <CadastroUsuarios />;
    }
  };

  const selectorComponent = (
    <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-blue-900 text-white p-8 rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Módulos de Configuração</h2>
        <p className="text-teal-100">Gerencie configurações e dados dos módulos do sistema</p>
      </div>

      {/* Seção de Módulos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeSubTab === "usuarios" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setActiveSubTab("usuarios")}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-teal-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Usuários</h3>
              <p className="text-sm text-teal-100">Gestão de acessos</p>
            </div>
          </div>
        </Card>

        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeSubTab === "cadeia" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setActiveSubTab("cadeia")}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Cadeia de Valor</h3>
              <p className="text-sm text-teal-100">Estrutura organizacional</p>
            </div>
          </div>
        </Card>

        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeSubTab === "entregaveis" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setActiveSubTab("entregaveis")}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-teal-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Entregáveis</h3>
              <p className="text-sm text-teal-100">Produtos e resultados</p>
            </div>
          </div>
        </Card>

        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeSubTab === "cronograma" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setActiveSubTab("cronograma")}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Cronograma</h3>
              <p className="text-sm text-teal-100">Planejamento temporal</p>
            </div>
          </div>
        </Card>

        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeSubTab === "riscos" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setActiveSubTab("riscos")}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-orange-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Colunas Riscos</h3>
              <p className="text-sm text-teal-100">Personalização de campos</p>
            </div>
          </div>
        </Card>

        <Card 
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeSubTab === "controles" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
          }`}
          onClick={() => setActiveSubTab("controles")}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Colunas Controles</h3>
              <p className="text-sm text-teal-100">Configuração de controles</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seção de Ferramentas */}
      <div className="border-t border-white/20 pt-6">
        <h3 className="text-xl font-semibold text-white mb-4">Ferramentas do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeSubTab === "carga" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
            }`}
            onClick={() => setActiveSubTab("carga")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Carga em Massa</h4>
                <p className="text-sm text-teal-100">Importação de dados</p>
              </div>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              activeSubTab === "backup" ? "ring-2 ring-white bg-white/10" : "bg-white/5 hover:bg-white/10"
            }`}
            onClick={() => setActiveSubTab("backup")}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-600 rounded">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Backup</h4>
                <p className="text-sm text-teal-100">Segurança dos dados</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {selectorComponent}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Cadastros;
