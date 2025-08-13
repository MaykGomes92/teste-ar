import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Target, Plus, TrendingUp, DollarSign, Clock, Star, AlertCircle, CheckCircle, Eye, Download, Upload } from "lucide-react";
import ImprovementActionModal from "./ImprovementActionModal";
import HierarchicalFilterBar from "./HierarchicalFilterBar";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';


const ImprovementActions = () => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [improvementModalOpen, setImprovementModalOpen] = useState(false);
  const [macroProcessFilter, setMacroProcessFilter] = useState([]);
  const [processFilter, setProcessFilter] = useState([]);
  const [riskFilter, setRiskFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [validationFilter, setValidationFilter] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImprovements();
  }, []);

  const fetchImprovements = async () => {
    try {
      const { data, error } = await supabase
        .from('melhorias')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setImprovements(data || []);
    } catch (error) {
      console.error('Erro ao buscar melhorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as melhorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar melhorias
  const getFilteredImprovements = () => {
    return improvements.filter(improvement => {
      const matchesRisk = riskFilter.length === 0 || riskFilter.includes(improvement.risco_id);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(improvement.status);
      const matchesValidation = validationFilter.length === 0 || 
        validationFilter.includes(improvement.validacao_etapa?.toString() || '0');
      
      return matchesRisk && matchesStatus && matchesValidation;
    });
  };

  const filteredImprovements = getFilteredImprovements();

  const handleClearFilters = () => {
    setMacroProcessFilter([]);
    setProcessFilter([]);
    setRiskFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "bg-red-100 text-red-800 border-red-200";
      case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixa": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
      case "Em Andamento": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planejado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Atrasado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Automação": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Tecnologia": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Processo": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Capacitação": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "Alto": return "bg-red-100 text-red-800 border-red-200";
      case "Médio": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixo": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownloadXLS = () => {
    const data = filteredImprovements.map(improvement => ({
      'Código': improvement.codigo || '',
      'Nome': improvement.nome,
      'Detalhamento da Solução': improvement.detalhamento_solucao || '',
      'Breve Descrição do Problema': improvement.breve_descricao_problema || '',
      'Atividade': improvement.descricao_problema || '',
      'Tipo de Oportunidade': improvement.tipo_oportunidade || '',
      'Ponto de Risco ou Controle': improvement.ponto_risco_controle ? 'Sim' : 'Não',
      'Esforço': improvement.esforco || '',
      'Benefício': improvement.beneficio || '',
      'Financeiro': improvement.financeiro ? 'Sim' : 'Não',
      'Redução DA': improvement.reducao_da ? 'Sim' : 'Não',
      'Produtividade': improvement.produtividade ? 'Sim' : 'Não',
      'Legal/Regulatório': improvement.legal_regulatorio ? 'Sim' : 'Não',
      'Priorização': improvement.priorizacao || '',
      'Tratativa': improvement.tratativa || '',
      'Sistema Envolvido': improvement.sistema_envolvido ? 'Sim' : 'Não',
      'Módulo do Sistema': improvement.modulo_sistema || '',
      'IFRS4': improvement.ifrs4 ? 'Sim' : 'Não',
      'IFRS17': improvement.ifrs17 ? 'Sim' : 'Não',
      'Potencial Implementação Imediata': improvement.potencial_implementacao_imediata ? 'Sim' : 'Não',
      'Sistema Será Substituído': improvement.sistema_sera_substituido ? 'Sim' : 'Não',
      'Novo Sistema': improvement.novo_sistema || '',
      'Previsão Implementação Novo Sistema': improvement.previsao_implementacao_novo_sistema || '',
      'Diferença SAP S/4HANNA': improvement.diferenca_sap_s4hanna || '',
      'Problema Sanado Novo Sistema': improvement.problema_sanado_novo_sistema ? 'Sim' : 'Não',
      'Necessidade de Integração': improvement.necessidade_integracao ? 'Sim' : 'Não',
      'Status': improvement.status,
      'Responsável': improvement.responsavel || '',
      'Validação Etapa': improvement.validacao_etapa || 0,
      'Processo ID': improvement.processo_id || '',
      'Criado em': new Date(improvement.created_at).toLocaleDateString('pt-BR'),
      'Atualizado em': new Date(improvement.updated_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Melhorias');
    XLSX.writeFile(wb, `melhorias_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Sucesso",
      description: "Arquivo XLS baixado com sucesso!",
    });
  };

  const handleUploadXLS = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData as any[]) {
        try {
          if (!row['Nome']) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from('melhorias')
            .insert({
              nome: row['Nome'],
              detalhamento_solucao: row['Detalhamento da Solução'] || '',
              breve_descricao_problema: row['Breve Descrição do Problema'] || '',
              descricao_problema: row['Atividade'] || '',
              tipo_oportunidade: row['Tipo de Oportunidade'] || '',
              ponto_risco_controle: row['Ponto de Risco ou Controle'] === 'Sim',
              esforco: row['Esforço'] || '',
              beneficio: row['Benefício'] || '',
              financeiro: row['Financeiro'] === 'Sim',
              reducao_da: row['Redução DA'] === 'Sim',
              produtividade: row['Produtividade'] === 'Sim',
              legal_regulatorio: row['Legal/Regulatório'] === 'Sim',
              priorizacao: row['Priorização'] || '',
              tratativa: row['Tratativa'] || '',
              sistema_envolvido: row['Sistema Envolvido'] === 'Sim',
              modulo_sistema: row['Módulo do Sistema'] || '',
              ifrs4: row['IFRS4'] === 'Sim',
              ifrs17: row['IFRS17'] === 'Sim',
              potencial_implementacao_imediata: row['Potencial Implementação Imediata'] === 'Sim',
              sistema_sera_substituido: row['Sistema Será Substituído'] === 'Sim',
              novo_sistema: row['Novo Sistema'] || '',
              previsao_implementacao_novo_sistema: row['Previsão Implementação Novo Sistema'] || '',
              diferenca_sap_s4hanna: row['Diferença SAP S/4HANNA'] || '',
              problema_sanado_novo_sistema: row['Problema Sanado Novo Sistema'] === 'Sim',
              necessidade_integracao: row['Necessidade de Integração'] === 'Sim',
              status: row['Status'] || 'Planejado',
              codigo: row['Código'] || '',
              responsavel: row['Responsável'] || '',
              validacao_etapa: parseInt(row['Validação Etapa']) || 0,
              processo_id: row['Processo ID'] || null,
              project_info_id: null
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Erro ao inserir melhoria:', row, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload concluído",
        description: `${successCount} melhorias importadas com sucesso. ${errorCount} erros.`,
      });

      fetchImprovements();
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo XLS",
        variant: "destructive",
      });
    }

    event.target.value = '';
  };

  // Data for charts
  const roiData = filteredImprovements.map(imp => ({
    name: (imp.nome || 'Sem nome').substring(0, 20) + "...",
    roi: 100, // Mock ROI
    cost: 50000, // Mock cost
    benefit: 150000 // Mock benefit
  }));

  const effortBenefitData = filteredImprovements.map(imp => ({
    name: (imp.nome || 'Sem nome').substring(0, 15) + "...",
    x: 2, // Mock effort
    y: 150, // Mock benefit
    size: 10,
    effort: "Médio"
  }));

  const stats = {
    total: filteredImprovements.length,
    inProgress: filteredImprovements.filter(i => i.status === "Planejado").length,
    completed: filteredImprovements.filter(i => i.status === "Concluído" || i.status === "Finalizado").length,
    totalInvestment: 200000, // Mock investment
    totalBenefit: 500000, // Mock benefit
    avgRoi: 150 // Mock ROI
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ações de Melhoria</h2>
          <p className="text-slate-600">Iniciativas de otimização com análise de custo-benefício</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => handleDownloadXLS()}
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar XLS
          </Button>
          
          <Button 
            variant="outline" 
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
            onClick={() => document.getElementById('upload-improvements-xls')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carga Massa XLS
          </Button>

          <input
            id="upload-improvements-xls"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleUploadXLS}
          />

          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => setImprovementModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Ação
          </Button>
          
        </div>
      </div>

      {/* Filtros Hierárquicos */}
      <HierarchicalFilterBar
        macroProcessFilter={macroProcessFilter}
        processFilter={processFilter}
        riskFilter={riskFilter}
        statusFilter={statusFilter}
        validationFilter={validationFilter}
        onMacroProcessChange={setMacroProcessFilter}
        onProcessChange={setProcessFilter}
        onRiskChange={setRiskFilter}
        onStatusChange={setStatusFilter}
        onValidationChange={setValidationFilter}
        onClearFilters={handleClearFilters}
        statusOptions={["Planejado", "Em Andamento", "Concluído", "Finalizado"]}
        showRiskFilter={true}
        showValidationFilter={true}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Ações</CardTitle>
              <Target className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
            <p className="text-sm text-slate-500">Iniciativas registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-sm text-slate-500">
              {Math.round((stats.inProgress / stats.total) * 100)}% do portfólio
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">ROI Médio</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.avgRoi}%</div>
            <p className="text-sm text-slate-500">Retorno sobre investimento</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Benefício Total</CardTitle>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              R$ {(stats.totalBenefit / 1000).toFixed(0)}k
            </div>
            <p className="text-sm text-slate-500">Benefício esperado</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Analysis */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Análise de ROI por Ação
            </CardTitle>
            <CardDescription>Retorno sobre investimento das iniciativas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="roi" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Effort vs Benefit */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Esforço vs Benefício
            </CardTitle>
            <CardDescription>Matriz de priorização das ações</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={effortBenefitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[0.5, 3.5]} 
                  tickFormatter={(value) => value === 1 ? "Baixo" : value === 2 ? "Médio" : "Alto"}
                  name="Esforço"
                />
                <YAxis type="number" dataKey="y" name="Benefício (k)" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    if (name === "y") return [`R$ ${value}k`, "Benefício"];
                    if (name === "x") return [props.payload.effort, "Esforço"];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    return payload && payload[0] ? payload[0].payload.name : label;
                  }}
                />
                <Scatter dataKey="y" fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Actions List */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Portfólio de Melhorias</CardTitle>
          <CardDescription>Lista completa das ações de melhoria e seu status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredImprovements.map((action) => (
              <div key={action.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">{action.nome}</h4>
                    <p className="text-slate-600 mb-3">{action.descricao || 'Sem descrição'}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getStatusColor(action.status)}>
                        {action.status}
                      </Badge>
                      
                      {/* Hierarquia: Macro → Processo → Risco → Controle → Melhoria */}
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Macro: Exemplo
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Processo: Exemplo
                      </Badge>
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Risco: Exemplo
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        Controle: Exemplo
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Melhoria: {action.codigo || `ME.${action.id.substring(0,8)}`} - {action.nome}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {action.validacao_etapa || 0}
                      </div>
                      <div className="text-sm text-slate-500">Etapa</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAction(action);
                        setImprovementModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Responsável:</span>
                    <p className="text-slate-800">{action.responsavel || 'Não definido'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Código:</span>
                    <p className="text-slate-800">{action.codigo || 'N/A'}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Criado em:</span>
                    <p className="text-slate-800">{new Date(action.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-600">Atualizado em:</span>
                    <p className="text-slate-800">{new Date(action.updated_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImprovementActionModal 
        open={improvementModalOpen}
        onOpenChange={setImprovementModalOpen}
        onSuccess={fetchImprovements}
      />
    </div>
  );
};

export default ImprovementActions;
