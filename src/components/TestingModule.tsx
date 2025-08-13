import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Plus, FileText, Target, AlertTriangle, TrendingUp, Calendar, Upload, Eye, Download } from "lucide-react";
import TestDetailsDialog from "./TestDetailsDialog";
import TestModal from "./TestModal";
import HierarchicalFilterBar from "./HierarchicalFilterBar";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';


interface TestingModuleProps {
  onProcessClick?: (processId: string) => void;
  selectedProjectId?: string;
}

const TestingModule = ({ onProcessClick, selectedProjectId }: TestingModuleProps) => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [macroProcessFilter, setMacroProcessFilter] = useState([]);
  const [processFilter, setProcessFilter] = useState([]);
  const [riskFilter, setRiskFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [validationFilter, setValidationFilter] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      // Use selectedProjectId or default to IRB template
      const projectId = selectedProjectId || 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
      const { data, error } = await supabase
        .from('testes')
        .select(`
          *,
          kris:controle_id (
            id,
            codigo,
            nome,
            riscos:risco_id (
              id,
              codigo,
              nome,
              processos:processo_id (
                id,
                nome,
                macro_processo
              )
            )
          )
        `)
        .eq('project_info_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Erro ao buscar testes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os testes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTests = () => {
    return tests.filter(test => {
      const matchesMacroProcess = macroProcessFilter.length === 0 || 
        (test.kris?.riscos?.processos?.macro_processo && macroProcessFilter.includes(test.kris.riscos.processos.macro_processo));
      const matchesProcess = processFilter.length === 0 || 
        (test.kris?.riscos?.processos?.nome && processFilter.includes(test.kris.riscos.processos.nome));
      const matchesRisk = riskFilter.length === 0 || 
        (test.kris?.riscos?.nome && riskFilter.includes(test.kris.riscos.nome));
      const matchesStatus = statusFilter.length === 0 || 
        statusFilter.includes(test.data_execucao ? "Concluído" : "Pendente");
      const matchesValidation = validationFilter.length === 0 || 
        validationFilter.includes(test.validacao_etapa?.toString() || '0');
      
      return matchesMacroProcess && matchesProcess && matchesRisk && matchesStatus && matchesValidation;
    });
  };

  const filteredTests = getFilteredTests();
  const designTests = filteredTests;
  const effectivenessTests = filteredTests;

  const handleClearFilters = () => {
    setMacroProcessFilter([]);
    setProcessFilter([]);
    setRiskFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
  };

  const handleDownloadXLS = () => {
    const data = filteredTests.map(test => ({
      'Código': test.codigo || '',
      'Nome': test.nome,
      'Descrição': test.descricao || '',
      'Executor': test.executor || '',
      'Revisor': test.revisor || '',
      'Data Execução': test.data_execucao ? new Date(test.data_execucao).toLocaleDateString('pt-BR') : '',
      'Maturidade': test.maturidade || 0,
      'Mitigação': test.mitigacao || 0,
      'Procedimento Realizado': test.procedimento_realizado || '',
      'Validação Etapa': test.validacao_etapa || 0,
      'Criado em': new Date(test.created_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Testes');
    XLSX.writeFile(wb, `testes_${new Date().toISOString().split('T')[0]}.xlsx`);
    
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
            .from('testes')
            .insert({
              nome: row['Nome'],
              descricao: row['Descrição'] || '',
              codigo: row['Código'] || '',
              executor: row['Executor'] || '',
              revisor: row['Revisor'] || '',
              data_execucao: row['Data Execução'] ? new Date(row['Data Execução']).toISOString().split('T')[0] : null,
              maturidade: parseInt(row['Maturidade']) || 0,
              mitigacao: parseInt(row['Mitigação']) || 0,
              procedimento_realizado: row['Procedimento Realizado'] || '',
              validacao_etapa: parseInt(row['Validação Etapa']) || 0,
              project_info_id: null
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Erro ao inserir teste:', row, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload concluído",
        description: `${successCount} testes importados com sucesso. ${errorCount} erros.`,
      });

      fetchTests();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
      case "Em Andamento": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planejado": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Pendente": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMaturityLabel = (level: number) => {
    switch (level) {
      case 0: return "Inexistente";
      case 1: return "Informal";
      case 2: return "Padronizado";
      case 3: return "Gerenciado";
      case 4: return "Otimizado";
      default: return "N/A";
    }
  };

  const getMitigationLabel = (level: number) => {
    switch (level) {
      case 0: return "Não Mitiga";
      case 1: return "Insatisfatório";
      case 2: return "Satisfatório";
      case 3: return "Bom";
      case 4: return "Ótimo";
      default: return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Módulo de Testes</h2>
          <p className="text-slate-600">Testes de desenho e efetividade dos controles</p>
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
            onClick={() => document.getElementById('upload-tests-xls')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carga Massa XLS
          </Button>

          <input
            id="upload-tests-xls"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleUploadXLS}
          />

          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setTestModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Teste
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
        statusOptions={["Concluído", "Pendente", "Em Andamento"]}
        showRiskFilter={true}
        showValidationFilter={true}
      />

      {/* Test Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Testes Realizados</CardTitle>
              <CheckCircle className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {filteredTests.length}
            </div>
            <p className="text-sm text-slate-500">Total de testes</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Testes de Desenho</CardTitle>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{filteredTests.filter(t => t.maturidade).length}</div>
            <p className="text-sm text-slate-500">Desenhos testados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Testes de Efetividade</CardTitle>
              <Target className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{filteredTests.filter(t => t.mitigacao).length}</div>
            <p className="text-sm text-slate-500">Efetividade testada</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Efetividade Média</CardTitle>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {filteredTests.length > 0 ? Math.round((filteredTests.filter(t => t.data_execucao).length / filteredTests.length) * 100) : 0}%
            </div>
            <p className="text-sm text-slate-500">Score médio</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="design">Testes de Desenho</TabsTrigger>
          <TabsTrigger value="effectiveness">Testes de Efetividade</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Testes de Desenho</CardTitle>
              <CardDescription>Avaliação da concepção e estrutura dos controles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTests.filter(t => t.maturidade !== null && t.maturidade !== undefined).map((test) => (
                  <div key={test.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">{test.nome}</h4>
                        
                        {/* Hierarquia: Macro → Processo → Risco → Controle → Teste */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {test.kris?.riscos?.processos?.macro_processo && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Macro: {test.kris.riscos.processos.macro_processo}
                            </Badge>
                          )}
                          {test.kris?.riscos?.processos && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Processo: {test.kris.riscos.processos.id} - {test.kris.riscos.processos.nome}
                            </Badge>
                          )}
                          {test.kris?.riscos && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Risco: {test.kris.riscos.codigo || `RI.${test.kris.riscos.id.substring(0,8)}`} - {test.kris.riscos.nome}
                            </Badge>
                          )}
                          {test.kris && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Controle: {test.kris.codigo || `CT.${test.kris.id.substring(0,8)}`} - {test.kris.nome}
                            </Badge>
                          )}
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Teste: {test.codigo || `TD.${test.id.substring(0,8)}`} - {test.nome}
                          </Badge>
                          <Badge className={getStatusColor(test.data_execucao ? "Concluído" : "Pendente")}>
                            {test.data_execucao ? "Concluído" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center text-sm text-slate-500 mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {test.data_execucao ? new Date(test.data_execucao).toLocaleDateString('pt-BR') : 'Não executado'}
                          </div>
                          <div className="text-sm text-slate-600">Executor: {test.executor || 'N/A'}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium text-slate-600 mb-1">Descrição:</div>
                      <p className="text-sm text-slate-800 bg-blue-50 p-2 rounded">{test.descricao || 'Sem descrição'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm font-medium text-slate-600 mb-1">Maturidade</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(test.maturidade || 0) * 25} className="flex-1 h-2" />
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {getMaturityLabel(test.maturidade || 0)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-600 mb-1">Mitigação</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(test.mitigacao || 0) * 25} className="flex-1 h-2" />
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {getMitigationLabel(test.mitigacao || 0)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div>
                        <span className="font-medium text-slate-600">Procedimento:</span>
                        <p className="text-slate-800 mt-1">{test.procedimento_realizado || 'Não informado'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Revisor:</span>
                        <p className="text-slate-800 mt-1">{test.revisor || 'Não informado'}</p>
                      </div>
                    </div>

                    {/* Evidências */}
                    {test.evidencia_names && test.evidencia_names.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-slate-600 mb-2">Evidências:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {test.evidencia_names.map((name, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white border rounded text-xs">
                              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span className="truncate" title={name}>{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {test.evidencia_names && test.evidencia_names.length > 0 ? 'Atualizar Evidências' : 'Carregar Evidências'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Testes de Efetividade</CardTitle>
              <CardDescription>Avaliação da operação e eficácia dos controles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTests.filter(t => t.mitigacao).map((test) => (
                  <div key={test.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">{test.nome}</h4>
                        
                        {/* Hierarquia: Macro → Processo → Risco → Controle → Teste */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {test.kris?.riscos?.processos?.macro_processo && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Macro: {test.kris.riscos.processos.macro_processo}
                            </Badge>
                          )}
                          {test.kris?.riscos?.processos && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Processo: {test.kris.riscos.processos.id} - {test.kris.riscos.processos.nome}
                            </Badge>
                          )}
                          {test.kris?.riscos && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Risco: {test.kris.riscos.codigo || `RI.${test.kris.riscos.id.substring(0,8)}`} - {test.kris.riscos.nome}
                            </Badge>
                          )}
                          {test.kris && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Controle: {test.kris.codigo || `CT.${test.kris.id.substring(0,8)}`} - {test.kris.nome}
                            </Badge>
                          )}
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Teste: {test.codigo || `TD.${test.id.substring(0,8)}`} - {test.nome}
                          </Badge>
                          <Badge className={getStatusColor(test.data_execucao ? "Concluído" : "Pendente")}>
                            {test.data_execucao ? "Concluído" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{(test.mitigacao || 0) * 25}%</div>
                          <div className="text-sm text-slate-500">Efetividade</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium text-slate-600 mb-1">Descrição:</div>
                      <p className="text-sm text-slate-800 bg-blue-50 p-2 rounded">{test.descricao || 'Sem descrição'}</p>
                    </div>

                    <div className="space-y-2 text-sm mb-3">
                      <div>
                        <span className="font-medium text-slate-600">Executor:</span>
                        <span className="text-slate-800 ml-1">{test.executor || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Data de Execução:</span>
                        <span className="text-slate-800 ml-1">{test.data_execucao ? new Date(test.data_execucao).toLocaleDateString('pt-BR') : 'Não executado'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Procedimento:</span>
                        <p className="text-slate-800 mt-1">{test.procedimento_realizado || 'Não informado'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Revisor:</span>
                        <p className="text-slate-800 mt-1">{test.revisor || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Carregar Evidências
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TestDetailsDialog 
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        test={selectedTest}
        onEdit={() => {
          setDetailsOpen(false);
          setSelectedTest(selectedTest);
          setTestModalOpen(true);
        }}
      />

      <TestModal 
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
        onSuccess={fetchTests}
      />
    </div>
  );
};

export default TestingModule;
