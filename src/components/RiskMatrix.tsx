
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Plus, TrendingUp, Shield, Target, Eye, Edit, Download, Upload, Archive, ArchiveRestore, History, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { generateRiskCode } from "@/lib/utils";
import HierarchicalFilterBar from "./HierarchicalFilterBar";
import RiskDetailsDialog from "./RiskDetailsDialog";

import COSOLinkingModal from "./COSOLinkingModal";
import { MultiSelect } from "@/components/ui/multi-select";
import * as XLSX from 'xlsx';


interface RiskMatrixProps {
  selectedProject?: string;
  selectedProjectId?: string;
  onModuleNavigate?: (module: string) => void;
}

const RiskMatrix = ({ selectedProject, selectedProjectId, onModuleNavigate }: RiskMatrixProps = {}) => {
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);
  const [macroProcessFilter, setMacroProcessFilter] = useState([]);
  const [processFilter, setProcessFilter] = useState([]);
  const [riskFilter, setRiskFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [validationFilter, setValidationFilter] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false);
  const [selectedRiskForLinking, setSelectedRiskForLinking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRisk, setNewRisk] = useState({
    area: "",
    macro_processo: "",
    processo_id: "",
    nome: "",
    categoria: "",
    categorias_pontuacao: {},
    probabilidade: "",
    nivel_impacto: "",
    impacto_calculado: 0,
    responsavel: "",
    descricao: "",
    causas: "",
    consequencias: ""
  });
  const { toast } = useToast();

  // Buscar processos do banco
  useEffect(() => {
    fetchProcesses();
    fetchRisks();
  }, []);

  // Recarregar dados quando a janela recebe foco
  useEffect(() => {
    const handleFocus = () => {
      fetchProcesses();
      fetchRisks();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchProcesses = async () => {
    try {
      // Always use IRB template for public access
      const projectId = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
      console.log('Fetching processes for project:', projectId);
      
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('project_info_id', projectId)
        .order('id');
      
      if (error) {
        console.error('Error fetching processes:', error);
        throw error;
      }
      
      console.log('Processes fetched:', data);
      setProcesses(data || []);
      
      // Extrair macro processos únicos
      const uniqueMacroProcesses = [...new Set(data?.map(p => p.macro_processo) || [])];
      setMacroProcesses(uniqueMacroProcesses);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os processos",
        variant: "destructive",
      });
    }
  };

  const handleMacroProcessChange = (macroProcess: string) => {
    setNewRisk({...newRisk, macro_processo: macroProcess, processo_id: ""});
    
    // Filtrar processos pelo macro processo selecionado
    const processesFiltered = processes.filter(process => process.macro_processo === macroProcess);
    setFilteredProcesses(processesFiltered);
  };

  const fetchRisks = async () => {
    try {
      // Always use IRB template for public access
      const projectId = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
      console.log('Fetching risks for project:', projectId);
      
      const { data, error } = await supabase
        .from('riscos')
        .select(`
          *,
          processos:processo_id (
            id,
            nome,
            macro_processo,
            macro_processo_id
          )
        `)
        .eq('project_info_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching risks:', error);
        throw error;
      }
      
      console.log('Risks fetched:', data);
      setRisks(data || []);
    } catch (error) {
      console.error('Erro ao buscar riscos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os riscos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRisk = async () => {
    try {
      // Always use IRB template for public access - no authentication required
      const projectId = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
      console.log('Creating risk for project:', projectId);

      // Buscar o processo selecionado para gerar o código
      const selectedProcess = processes.find(p => p.id === newRisk.processo_id);
      if (!selectedProcess) throw new Error('Processo não encontrado');
      
      // Gerar código automático do risco
      const riskCode = await generateRiskCode(newRisk.nome, selectedProcess.id);

      // Remover macro_processo antes de inserir no banco (não existe na tabela)
      const { macro_processo, ...riskData } = newRisk;
      
      const { error } = await supabase
        .from('riscos')
        .insert([{
          ...riskData,
          codigo: riskCode,
          user_id: null, // Allow null for public access
          project_info_id: projectId,
          status: 'Identificado'
        }]);

      if (error) {
        console.error('Error creating risk:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Risco registrado com sucesso!",
      });

      setNewRisk({
        area: "",
        macro_processo: "",
        processo_id: "",
        nome: "",
        categoria: "",
        categorias_pontuacao: {},
        probabilidade: "",
        nivel_impacto: "",
        impacto_calculado: 0,
        responsavel: "",
        descricao: "",
        causas: "",
        consequencias: ""
      });

      fetchRisks();
    } catch (error) {
      console.error('Erro ao criar risco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o risco",
        variant: "destructive",
      });
    }
  };

  // Função para filtrar riscos
  const getFilteredRisks = () => {
    return risks.filter(risk => {
      const matchesArchived = showArchived ? risk.archived : !risk.archived;
      const matchesMacroProcess = macroProcessFilter.length === 0 || 
        (risk.processos && macroProcessFilter.includes(risk.processos.macro_processo));
      const matchesProcess = processFilter.length === 0 || 
        (risk.processos && processFilter.includes(risk.processos.nome));
      const matchesRisk = riskFilter.length === 0 || riskFilter.includes(risk.nome);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(risk.status);
      const matchesValidation = validationFilter.length === 0 || 
        validationFilter.includes(risk.validacao_etapa?.toString() || '0');
      
      return matchesArchived && matchesMacroProcess && matchesProcess && matchesRisk && matchesStatus && matchesValidation;
    });
  };

  const handleArchiveRisk = async (riskId: string, shouldArchive: boolean) => {
    try {
      const { error } = await supabase.rpc('archive_risk', {
        risk_id: riskId,
        should_archive: shouldArchive,
        user_id: null // Allow null for public access
      });

      if (error) {
        console.error('Error archiving risk:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: shouldArchive ? "Risco arquivado com sucesso!" : "Risco desarquivado com sucesso!",
      });

      fetchRisks();
    } catch (error) {
      console.error('Erro ao arquivar risco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar/desarquivar o risco",
        variant: "destructive",
      });
    }
  };

  const filteredRisks = getFilteredRisks();

  const handleClearFilters = () => {
    setMacroProcessFilter([]);
    setProcessFilter([]);
    setRiskFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
  };

  const handleViewDetails = (risk: any) => {
    setSelectedRisk(risk);
    setDetailsOpen(true);
  };

  const handleDownloadXLS = () => {
    const data = filteredRisks.map(risk => ({
      'Código': risk.codigo || '',
      'Nome': risk.nome,
      'Categoria': risk.categoria,
      'Probabilidade': risk.probabilidade,
      'Nível Impacto': risk.nivel_impacto,
      'Status': risk.status,
      'Processo': risk.processos?.nome || '',
      'Macro Processo': risk.processos?.macro_processo || '',
      'Responsável': risk.responsavel || '',
      'Descrição': risk.descricao || '',
      'Causas': risk.causas || '',
      'Consequências': risk.consequencias || '',
      'Validação Etapa': risk.validacao_etapa || 0,
      'Criado em': new Date(risk.created_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Riscos');
    XLSX.writeFile(wb, `riscos_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Sucesso",
      description: "Arquivo XLS baixado com sucesso!",
    });
  };

  const handleUploadXLS = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Always use IRB template for public access
      const projectId = 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData as any[]) {
        try {
          if (!row['Nome'] || !row['Categoria']) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from('riscos')
            .insert({
              nome: row['Nome'],
              categoria: row['Categoria'],
              probabilidade: row['Probabilidade'] || 'Baixa',
              nivel_impacto: row['Nível Impacto'] || 'Baixo',
              status: row['Status'] || 'Identificado',
              codigo: row['Código'] || '',
              responsavel: row['Responsável'] || '',
              descricao: row['Descrição'] || '',
              causas: row['Causas'] || '',
              consequencias: row['Consequências'] || '',
              validacao_etapa: parseInt(row['Validação Etapa']) || 0,
              project_info_id: projectId
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Erro ao inserir risco:', row, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload concluído",
        description: `${successCount} riscos importados com sucesso. ${errorCount} erros.`,
      });

      fetchRisks();
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

  const statusOptions = ["Identificado", "Ativo", "Mitigado", "Em Monitoramento"];

  const getRiskLevel = (probabilidade, impacto) => {
    const probNum = parseInt(probabilidade) || 1;
    const impNum = parseInt(impacto) || 1;
    const score = probNum * impNum;
    
    if (score >= 15) return { level: "Crítico", color: "bg-red-600", textColor: "text-white", score };
    if (score >= 10) return { level: "Alto", color: "bg-red-400", textColor: "text-white", score };
    if (score >= 6) return { level: "Médio", color: "bg-yellow-400", textColor: "text-gray-800", score };
    return { level: "Baixo", color: "bg-green-400", textColor: "text-white", score };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Identificado": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Ativo": return "bg-red-100 text-red-800 border-red-200";
      case "Mitigado": return "bg-green-100 text-green-800 border-green-200";
      case "Em Monitoramento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Tecnológico": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Operacional": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Conformidade": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Estratégico": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Financeiro": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Create matrix grid
  const createRiskMatrix = () => {
    const matrix = [];
    for (let impact = 5; impact >= 1; impact--) {
      const row = [];
      for (let probability = 1; probability <= 5; probability++) {
        const riskInCell = filteredRisks.find(r => 
          parseInt(r.probabilidade) === probability && parseInt(r.nivel_impacto) === impact
        );
        row.push({
          probability,
          impact,
          risk: riskInCell,
          score: probability * impact
        });
      }
      matrix.push(row);
    }
    return matrix;
  };

  const riskMatrix = createRiskMatrix();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Risk Matrix Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Matriz de Riscos</h2>
          <p className="text-slate-600">Identificação, análise e priorização de riscos organizacionais</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showArchived ? "default" : "outline"}
            className={showArchived ? "bg-gray-600 hover:bg-gray-700" : "border-gray-600 text-gray-600 hover:bg-gray-50"}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
            {showArchived ? "Mostrar Ativos" : "Mostrar Arquivados"}
          </Button>
          
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
            onClick={() => document.getElementById('upload-risks-xls')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carga Massa XLS
          </Button>

          <input
            id="upload-risks-xls"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleUploadXLS}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  // Aplicar filtros atuais como valores padrão
                  if (macroProcessFilter.length > 0) {
                    setNewRisk(prev => ({
                      ...prev, 
                      macro_processo: macroProcessFilter[0],
                      processo_id: processFilter.length > 0 ? processFilter[0] : ""
                    }));
                    handleMacroProcessChange(macroProcessFilter[0]);
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Risco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Novo Risco</DialogTitle>
              <DialogDescription>
                Identifique e registre um novo risco para análise
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4 space-y-0">
              {/* Macro Processo */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="macro_processo">Macro Processo</Label>
                <Select 
                  value={newRisk.macro_processo} 
                  onValueChange={handleMacroProcessChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o macro processo" />
                  </SelectTrigger>
                  <SelectContent>
                    {macroProcesses.map((macroProcess) => (
                      <SelectItem key={macroProcess} value={macroProcess}>
                        {macroProcess}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Processo */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="process">Processo</Label>
                <Select 
                  value={newRisk.processo_id} 
                  onValueChange={(value) => {
                    const selectedProcess = processes.find(p => p.id === value);
                    setNewRisk({
                      ...newRisk, 
                      processo_id: value,
                      macro_processo: selectedProcess ? selectedProcess.macro_processo : ""
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o processo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(newRisk.macro_processo ? filteredProcesses : processes).map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.id} - {process.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Código do risco (informativo) */}
              <div className="col-span-2 space-y-2">
                <Label>Código do risco</Label>
                <div className="p-2 bg-gray-50 rounded border text-sm text-gray-600">
                  Será gerado automaticamente após salvar
                </div>
              </div>

              {/* Área */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="area">Área</Label>
                <Input 
                  id="area" 
                  placeholder="Informe a área responsável"
                  value={newRisk.area}
                  onChange={(e) => setNewRisk({...newRisk, area: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="riskTitle">Risco</Label>
                <Input 
                  id="riskTitle" 
                  placeholder="Ex: Falha no sistema crítico"
                  value={newRisk.nome}
                  onChange={(e) => setNewRisk({...newRisk, nome: e.target.value})}
                />
              </div>

              {/* Descrição */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o risco detalhadamente"
                  value={newRisk.descricao}
                  onChange={(e) => setNewRisk({...newRisk, descricao: e.target.value})}
                />
              </div>

              {/* Causas */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="causas">Causas</Label>
                <Textarea 
                  id="causas" 
                  placeholder="Descreva as possíveis causas do risco"
                  value={newRisk.causas}
                  onChange={(e) => setNewRisk({...newRisk, causas: e.target.value})}
                />
              </div>

              {/* Consequências */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="consequencias">Consequências</Label>
                <Textarea 
                  id="consequencias" 
                  placeholder="Descreva as possíveis consequências do risco"
                  value={newRisk.consequencias}
                  onChange={(e) => setNewRisk({...newRisk, consequencias: e.target.value})}
                />
              </div>

              {/* Separador para Classificação do Risco */}
              <div className="col-span-2 mt-6">
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Classificação do Risco</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Probabilidade */}
                    <div className="space-y-2">
                      <Label htmlFor="probability">Probabilidade</Label>
                      <Select value={newRisk.probabilidade} onValueChange={(value) => setNewRisk({...newRisk, probabilidade: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Baixa</SelectItem>
                          <SelectItem value="2">2 - Baixa</SelectItem>
                          <SelectItem value="3">3 - Média</SelectItem>
                          <SelectItem value="4">4 - Alta</SelectItem>
                          <SelectItem value="5">5 - Muito Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Impacto (renomeado de nivel_impacto) */}
                    <div className="space-y-2">
                      <Label htmlFor="impact">Impacto</Label>
                      <Select value={newRisk.nivel_impacto} onValueChange={(value) => setNewRisk({...newRisk, nivel_impacto: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Baixo</SelectItem>
                          <SelectItem value="2">2 - Baixo</SelectItem>
                          <SelectItem value="3">3 - Médio</SelectItem>
                          <SelectItem value="4">4 - Alto</SelectItem>
                          <SelectItem value="5">5 - Muito Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Categorias */}
                  <div className="col-span-2 space-y-3 mt-4">
                    <Label className="text-base font-semibold">Categorias</Label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-white">
                       {["Operacional", "Financeiro", "Estratégico", "Conformidade", "Tecnológico", "Ambiental", "Reputacional", "Legal"].map((categoria) => (
                        <div key={categoria} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border border-gray-200">
                          <span className="text-sm font-medium text-gray-700">{categoria}</span>
                          <Select 
                            value={newRisk.categorias_pontuacao[categoria]?.toString() || ""}
                            onValueChange={(value) => {
                              const newCategorias = { ...newRisk.categorias_pontuacao };
                              if (value === "0" || value === "") {
                                delete newCategorias[categoria];
                              } else {
                                newCategorias[categoria] = parseInt(value);
                              }
                              const maxScore = Math.max(0, ...Object.values(newCategorias).map(v => typeof v === 'number' ? v : 0));
                              setNewRisk({
                                ...newRisk, 
                                categorias_pontuacao: newCategorias,
                                impacto_calculado: maxScore,
                                categoria: Object.keys(newCategorias).join(", ") // Manter compatibilidade
                              });
                            }}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Nível" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">N/A</SelectItem>
                              <SelectItem value="1">Baixo</SelectItem>
                              <SelectItem value="2">Moderado</SelectItem>
                              <SelectItem value="3">Significativo</SelectItem>
                              <SelectItem value="4">Crítico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    
                    {/* Campo de Impacto Calculado */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-blue-800">Impacto Calculado (Automático)</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-blue-600">{newRisk.impacto_calculado}</span>
                          <span className="text-sm text-blue-600">
                            {newRisk.impacto_calculado === 0 ? "N/A" :
                             newRisk.impacto_calculado === 1 ? "Baixo" :
                             newRisk.impacto_calculado === 2 ? "Moderado" :
                             newRisk.impacto_calculado === 3 ? "Significativo" : "Crítico"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Baseado no maior valor selecionado nas categorias acima
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleCreateRisk}
              disabled={!newRisk.nome || !newRisk.categoria || !newRisk.probabilidade || !newRisk.nivel_impacto}
            >
              Registrar Risco
            </Button>
            </DialogContent>
          </Dialog>
          
        </div>
      </div>

      {/* Filtros em Card - mesmo estilo do Mapeamento de Processos */}
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filtros:</span>
            </div>

            {/* Macro Processo */}
            <div className="min-w-48">
              <MultiSelect
                options={macroProcesses.map(mp => ({
                  value: mp.nome || mp.id || '',
                  label: mp.codigo ? `${mp.codigo} - ${mp.nome}` : `MP.${(mp.id || '').substring(0,8)} - ${mp.nome || 'Sem nome'}`
                }))}
                value={macroProcessFilter}
                onChange={setMacroProcessFilter}
                placeholder="Macro Processos"
                maxDisplayed={2}
              />
            </div>

            {/* Processo */}
            <div className="min-w-48">
              <MultiSelect
                options={filteredProcesses.map(process => ({
                  value: process.id || '',
                  label: process.codigo ? `${process.codigo} - ${process.nome}` : `PR.${(process.id || '').substring(0,8)} - ${process.nome || 'Sem nome'}`
                }))}
                value={processFilter}
                onChange={setProcessFilter}
                placeholder="Processos"
                maxDisplayed={2}
              />
            </div>

            {/* Categoria de Risco */}
            <div className="min-w-48">
              <MultiSelect
                options={[
                  { value: "Operacional", label: "Operacional" },
                  { value: "Estratégico", label: "Estratégico" },
                  { value: "Financeiro", label: "Financeiro" },
                  { value: "Compliance", label: "Compliance" },
                  { value: "Tecnológico", label: "Tecnológico" },
                  { value: "Reputacional", label: "Reputacional" }
                ]}
                value={riskFilter}
                onChange={setRiskFilter}
                placeholder="Categorias"
                maxDisplayed={2}
              />
            </div>

            {/* Status */}
            <div className="min-w-44">
              <MultiSelect
                options={statusOptions.map(status => ({
                  value: status,
                  label: status
                }))}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
                maxDisplayed={2}
              />
            </div>

            {/* Validação */}
            <div className="min-w-52">
              <MultiSelect
                options={[
                  { value: "0", label: "0 - Não Iniciado" },
                  { value: "1", label: "1 - Em desenvolvimento" },
                  { value: "2", label: "2 - Em revisão" },
                  { value: "3", label: "3 - Aprovação QA CI" },
                  { value: "4", label: "4 - Aprovação Cliente" },
                  { value: "5", label: "5 - Aprovação CI" },
                  { value: "6", label: "6 - Concluído" }
                ]}
                value={validationFilter}
                onChange={setValidationFilter}
                placeholder="Etapas de Validação"
                maxDisplayed={2}
              />
            </div>

            {/* Botão Limpar Filtros */}
            {(macroProcessFilter.length > 0 || processFilter.length > 0 || riskFilter.length > 0 || statusFilter.length > 0 || validationFilter.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 px-3"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Indicador de Filtros Ativos */}
          {(macroProcessFilter.length > 0 || processFilter.length > 0 || riskFilter.length > 0 || statusFilter.length > 0 || validationFilter.length > 0) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span>Filtros ativos:</span>
              {macroProcessFilter.length > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Macro: {macroProcessFilter.length}
                </span>
              )}
              {processFilter.length > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  Processos: {processFilter.length}
                </span>
              )}
              {riskFilter.length > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  Categorias: {riskFilter.length}
                </span>
              )}
              {statusFilter.length > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                  Status: {statusFilter.length}
                </span>
              )}
              {validationFilter.length > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                  Validação: {validationFilter.length}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                {showArchived ? "Riscos Arquivados" : "Total de Riscos"}
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{filteredRisks.length}</div>
            <p className="text-sm text-slate-500">
              {showArchived ? "Arquivados" : "Ativos no sistema"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Riscos Críticos</CardTitle>
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {filteredRisks.filter(r => {
                const riskLevel = getRiskLevel(r.probabilidade, r.nivel_impacto);
                return riskLevel.score >= 15;
              }).length}
            </div>
            <p className="text-sm text-slate-500">Requerem ação imediata</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Riscos Mitigados</CardTitle>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredRisks.filter(r => r.status === "Mitigado").length}
            </div>
            <p className="text-sm text-slate-500">Controles implementados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Score Médio</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {filteredRisks.length > 0 ? (
                filteredRisks.reduce((sum, r) => {
                  const riskLevel = getRiskLevel(r.probabilidade, r.nivel_impacto);
                  return sum + riskLevel.score;
                }, 0) / filteredRisks.length
              ).toFixed(1) : '0.0'}
            </div>
            <p className="text-sm text-slate-500">Risco organizacional</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix Visualization */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-600" />
            Matriz de Probabilidade vs Impacto
          </CardTitle>
          <CardDescription>
            Visualização gráfica dos riscos baseada na metodologia ISO 31000
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-96">
              {/* Matrix Labels */}
              <div className="flex items-center mb-4">
                <div className="w-20"></div>
                <div className="flex-1 text-center">
                  <div className="text-sm font-semibold text-slate-600 mb-2">PROBABILIDADE</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(prob => (
                      <div key={prob} className="flex-1 text-center text-xs text-slate-500">
                        {prob === 1 ? "Muito Baixa" : prob === 2 ? "Baixa" : prob === 3 ? "Média" : prob === 4 ? "Alta" : "Muito Alta"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="flex">
                <div className="w-20 flex flex-col items-center justify-center">
                  <div className="text-sm font-semibold text-slate-600 mb-4 transform -rotate-90">IMPACTO</div>
                </div>
                <div className="flex-1">
                  {riskMatrix.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex mb-1">
                      {row.map((cell, cellIndex) => {
                        const riskLevel = getRiskLevel(cell.probability.toString(), cell.impact.toString());
                        return (
                          <div
                            key={cellIndex}
                            className={`flex-1 h-16 border border-slate-200 relative ${riskLevel.color} ${riskLevel.textColor} flex items-center justify-center text-xs font-medium`}
                          >
                            <div className="text-center">
                              <div className="font-bold">{cell.score}</div>
                              {cell.risk && (
                                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400"></div>
                  <span>Baixo (1-5)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400"></div>
                  <span>Médio (6-9)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-400"></div>
                  <span>Alto (10-14)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600"></div>
                  <span>Crítico (15-25)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Registro de Riscos</CardTitle>
          <CardDescription>Lista detalhada de todos os riscos identificados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRisks.map((risk) => {
              const riskLevel = getRiskLevel(risk.probabilidade, risk.nivel_impacto);
              return (
                <div key={risk.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center space-x-3">
                         <h4 className="font-semibold text-slate-800">{risk.nome}</h4>
                         <Badge className={getCategoryColor(risk.categoria)}>
                           {risk.categoria}
                         </Badge>
                         <Badge className={getStatusColor(risk.status)}>
                           {risk.status}
                         </Badge>
                       </div>
                       
                       {/* Classificações na ordem: Macro Processo, Processo, Risco */}
                       <div className="flex items-center space-x-3 mb-2">
                          {risk.processos?.macro_processo && (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Macro: {risk.processos.macro_processo_id || `MP.${(risk.processos.macro_processo || '').substring(0,3)}`} - {risk.processos.macro_processo}
                            </Badge>
                          )}
                         {risk.processos && (
                           <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                             Processo: {risk.processos.id || risk.processo_id} - {risk.processos.nome}
                           </Badge>
                         )}
                         <Badge className="bg-red-100 text-red-800 border-red-200">
                           Risco: {risk.codigo || `RI.${(risk.id || '').substring(0,8)}`} - {risk.nome}
                         </Badge>
                       </div>
                       
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                         <div>
                           <span className="font-medium">Responsável:</span> {risk.responsavel || 'N/A'}
                         </div>
                         <div>
                           <span className="font-medium">Probabilidade:</span> {risk.probabilidade}/5
                         </div>
                         <div>
                           <span className="font-medium">Impacto:</span> {risk.nivel_impacto}/5
                         </div>
                       </div>

                      {risk.descricao && (
                        <div className="text-sm text-slate-600">
                          <span className="font-medium">Descrição:</span> {risk.descricao}
                        </div>
                      )}
                    </div>
                    
                     <div className="flex items-center space-x-2">
                       <div className="text-center">
                         <div className={`px-3 py-1 rounded-full text-sm font-bold ${riskLevel.color} ${riskLevel.textColor}`}>
                           {riskLevel.score}
                         </div>
                         <div className="text-xs text-slate-500 mt-1">{riskLevel.level}</div>
                       </div>
                       
                       {!showArchived && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleArchiveRisk(risk.id, true)}
                           className="border-orange-600 text-orange-600 hover:bg-orange-50"
                         >
                           <Archive className="w-4 h-4" />
                         </Button>
                       )}
                       
                       {showArchived && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleArchiveRisk(risk.id, false)}
                           className="border-green-600 text-green-600 hover:bg-green-50"
                         >
                           <ArchiveRestore className="w-4 h-4" />
                         </Button>
                       )}
                       
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(risk)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedRisk(risk);
                            setEditingRisk(risk.id);
                            setDetailsOpen(true);
                          }}
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Risco */}
      <RiskDetailsDialog
        risk={selectedRisk}
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setEditingRisk(null);
          }
        }}
        onUpdate={fetchRisks}
        startInEditMode={editingRisk === selectedRisk?.id}
      />
    </div>
  );
};

export default RiskMatrix;
