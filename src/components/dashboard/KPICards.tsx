import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, AlertTriangle, Shield, Target, CheckCircle, Clock } from "lucide-react";
import { useProjectData } from "@/hooks/useProjectData";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface KPICardsProps {
  onNavigate?: (tab: string) => void;
  selectedProjectId?: string;
}

interface ValidationData {
  total: number;
  validationStages: {
    [stage: string]: {
      count: number;
      avgDays: number;
    };
  };
}

const KPICards = ({ onNavigate, selectedProjectId }: KPICardsProps) => {
  const { projectDetails, isLoading, updateProjectMetrics } = useProjectData(selectedProjectId);
  
  // Estados para dados de validação
  const [processData, setProcessData] = useState<ValidationData>({ total: 0, validationStages: {} });
  const [riskData, setRiskData] = useState<ValidationData>({ total: 0, validationStages: {} });
  const [controlData, setControlData] = useState<ValidationData>({ total: 0, validationStages: {} });
  const [testData, setTestData] = useState<ValidationData>({ total: 0, validationStages: {} });
  const [loading, setLoading] = useState(true);

  // Buscar dados reais
  useEffect(() => {
    if (selectedProjectId) {
      fetchValidationData();
    }
  }, [selectedProjectId]);

  const getValidationStageName = (stage: number) => {
    switch (stage) {
      case 0: return 'Não Iniciado';
      case 1: return 'Em desenvolvimento';
      case 2: return 'Em revisão';
      case 3: return 'Aprovação QA CI';
      case 4: return 'Aprovação Cliente';
      case 5: return 'Aprovação CI';
      case 6: return 'Concluído';
      default: return 'Indefinido';
    }
  };

  const calculateDaysInStage = (updatedAt: string) => {
    const updated = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const processValidationData = (data: any[]) => {
    const total = data.length;
    const validationStages: { [stage: string]: { count: number; avgDays: number } } = {};

    data.forEach(item => {
      const stage = getValidationStageName(item.validacao_etapa || 0);
      const days = calculateDaysInStage(item.updated_at || item.created_at);
      
      if (!validationStages[stage]) {
        validationStages[stage] = { count: 0, avgDays: 0 };
      }
      
      validationStages[stage].count += 1;
      validationStages[stage].avgDays = 
        (validationStages[stage].avgDays * (validationStages[stage].count - 1) + days) / validationStages[stage].count;
    });

    // Arredondar média de dias
    Object.keys(validationStages).forEach(stage => {
      validationStages[stage].avgDays = Math.round(validationStages[stage].avgDays);
    });

    return { total, validationStages };
  };

  const fetchValidationData = async () => {
    try {
      // Buscar processos
      const { data: processos } = await supabase
        .from('processos')
        .select('validacao_etapa, updated_at, created_at')
        .eq('project_info_id', selectedProjectId);

      if (processos) {
        setProcessData(processValidationData(processos));
      }

      // Buscar riscos
      const { data: riscos } = await supabase
        .from('riscos')
        .select('validacao_etapa, updated_at, created_at')
        .eq('project_info_id', selectedProjectId);

      if (riscos) {
        setRiskData(processValidationData(riscos));
      }

      // Buscar controles (KRIs)
      const { data: controles } = await supabase
        .from('kris')
        .select('validacao_etapa, updated_at, created_at')
        .eq('project_info_id', selectedProjectId);

      if (controles) {
        setControlData(processValidationData(controles));
      }

      // Buscar testes
      const { data: testes } = await supabase
        .from('testes')
        .select('validacao_etapa, updated_at, created_at')
        .eq('project_info_id', selectedProjectId);

      if (testes) {
        setTestData(processValidationData(testes));
      }

    } catch (error) {
      console.error('Erro ao buscar dados de validação:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar métricas quando o componente carrega
  useEffect(() => {
    if (selectedProjectId && projectDetails) {
      updateProjectMetrics();
    }
  }, [selectedProjectId, projectDetails]);

  const handleCardClick = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const renderValidationTable = (validationData: ValidationData, title: string) => {
    const stages = Object.entries(validationData.validationStages);
    if (stages.length === 0) return <p className="text-xs text-slate-500">Nenhum dado disponível</p>;

    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-600">{title}:</p>
        <div className="space-y-1">
          {stages.map(([stage, data]) => {
            const isNotStarted = stage === 'Não Iniciado';
            return (
              <div 
                key={stage} 
                className={`flex justify-between items-center text-xs p-2 rounded ${
                  isNotStarted ? 'bg-yellow-50 border border-yellow-200' : ''
                }`}
              >
                <span className={`${isNotStarted ? 'text-yellow-800 font-medium' : 'text-slate-600'}`}>
                  {stage}
                </span>
                <div className="text-right">
                  <div className={`font-medium ${isNotStarted ? 'text-yellow-900' : 'text-slate-800'}`}>
                    {data.count}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {data.avgDays}d
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="bg-white shadow-lg animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Framework COSO Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Framework COSO</h2>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        <p className="text-sm text-slate-600 mt-2">
          Estrutura Integrada de Controles Internos
        </p>
      </div>

      {/* Framework Visual com Conexões */}
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
        {/* Linha de conexão horizontal principal */}
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-300 via-green-300 via-purple-300 to-orange-300 transform -translate-y-1/2 z-0"></div>
        
        {/* Setas de conexão */}
        <div className="absolute top-1/2 left-[18%] w-4 h-4 transform -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-4 border-l-blue-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
        <div className="absolute top-1/2 left-[38%] w-4 h-4 transform -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-4 border-l-green-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
        <div className="absolute top-1/2 left-[58%] w-4 h-4 transform -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-4 border-l-purple-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>
        <div className="absolute top-1/2 left-[78%] w-4 h-4 transform -translate-y-1/2 z-10">
          <div className="w-0 h-0 border-l-4 border-l-orange-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
        </div>

        {/* Grid de Cards */}
        <div className="relative z-20 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Card Processos */}
          <Card 
            className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-blue-200 hover:border-blue-400"
            onClick={() => handleCardClick('processes')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Processos</CardTitle>
                <div className="p-2 rounded-lg bg-blue-50">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-700">{processData.total}</span>
                  <p className="text-xs text-slate-500">Mapeados</p>
                </div>
                {renderValidationTable(processData, "Status")}
              </div>
            </CardContent>
          </Card>

          {/* Card Riscos */}
          <Card 
            className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-red-200 hover:border-red-400"
            onClick={() => handleCardClick('risks')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Riscos</CardTitle>
                <div className="p-2 rounded-lg bg-red-50">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-3xl font-bold text-red-700">{riskData.total}</span>
                  <p className="text-xs text-slate-500">Identificados</p>
                </div>
                {renderValidationTable(riskData, "Status")}
              </div>
            </CardContent>
          </Card>

          {/* Card Controles */}
          <Card 
            className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-green-200 hover:border-green-400"
            onClick={() => handleCardClick('controls')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Controles</CardTitle>
                <div className="p-2 rounded-lg bg-green-50">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-3xl font-bold text-green-700">{controlData.total}</span>
                  <p className="text-xs text-slate-500">Implementados</p>
                </div>
                {renderValidationTable(controlData, "Status")}
              </div>
            </CardContent>
          </Card>

          {/* Card Testes */}
          <Card 
            className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
            onClick={() => handleCardClick('testing')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Testes</CardTitle>
                <div className="p-2 rounded-lg bg-purple-50">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-3xl font-bold text-purple-700">{testData.total}</span>
                  <p className="text-xs text-slate-500">Executados</p>
                </div>
                {renderValidationTable(testData, "Status")}
              </div>
            </CardContent>
          </Card>

          {/* Card Melhorias */}
          <Card 
            className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 border-2 border-orange-200 hover:border-orange-400"
            onClick={() => handleCardClick('improvements')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Melhorias</CardTitle>
                <div className="p-2 rounded-lg bg-orange-50">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-3xl font-bold text-orange-700">
                    {projectDetails?.acoes_melhoria || 0}
                  </span>
                  <p className="text-xs text-slate-500">Identificadas</p>
                </div>
                <Progress 
                  value={projectDetails ? (projectDetails.acoes_melhoria / projectDetails.acoes_melhoria_meta) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-slate-500 text-center">
                  {projectDetails ? Math.round((projectDetails.acoes_melhoria / projectDetails.acoes_melhoria_meta) * 100) : 0}% da meta
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Labels do Fluxo */}
        <div className="mt-6 flex justify-between text-xs text-slate-500 px-4">
          <span>Identificação</span>
          <span>Avaliação</span>
          <span>Mitigação</span>
          <span>Validação</span>
          <span>Melhoria</span>
        </div>
      </div>
    </div>
  );
};

export default KPICards;