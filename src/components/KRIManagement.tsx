
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Plus, Activity, Target, AlertCircle, Edit, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import HierarchicalFilterBar from "./HierarchicalFilterBar";

import * as XLSX from 'xlsx';


interface KRIManagementProps {
  selectedProject?: string;
  selectedProjectId?: string;
  onModuleNavigate?: (module: string) => void;
}

const KRIManagement = ({ selectedProject, selectedProjectId, onModuleNavigate }: KRIManagementProps = {}) => {
  const [macroProcessFilter, setMacroProcessFilter] = useState([]);
  const [processFilter, setProcessFilter] = useState([]);
  const [riskFilter, setRiskFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [validationFilter, setValidationFilter] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [kris, setKris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKri, setEditingKri] = useState(null);
  const [newKri, setNewKri] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    tipo_medicao: "",
    frequencia_medicao: "",
    meta_tier1: "",
    meta_tier2: "",
    meta_tier3: "",
    referencia_mercado: "",
    processo_id: "",
    responsavel: "",
    risco_id: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use selectedProjectId or default to IRB template
      const projectId = selectedProjectId || 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
      
      // Buscar processos
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select('*')
        .eq('project_info_id', projectId)
        .order('id');
      
      if (processesError) throw processesError;
      setProcesses(processesData || []);

      // Buscar riscos
      const { data: risksData, error: risksError } = await supabase
        .from('riscos')
        .select(`
          *,
          processos:processo_id (
            id,
            nome,
            macro_processo
          )
        `)
        .eq('project_info_id', projectId)
        .order('nome');
      
      if (risksError) throw risksError;
      setRisks(risksData || []);

      // Buscar KRIs
      const { data: krisData, error: krisError } = await supabase
        .from('kris')
        .select(`
          *,
          processos:processo_id (
            id,
            nome,
            macro_processo
          ),
          riscos:risco_id (
            id,
            nome
          )
        `)
        .eq('project_info_id', projectId)
        .order('created_at', { ascending: false });
      
      if (krisError) throw krisError;
      setKris(krisData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKri = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Use selectedProjectId or default to IRB template
      const projectId = selectedProjectId || 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

      const kriData = {
        ...newKri,
        user_id: user.id,
        project_info_id: projectId,
        meta_tier1: newKri.meta_tier1 ? parseFloat(newKri.meta_tier1) : null,
        meta_tier2: newKri.meta_tier2 ? parseFloat(newKri.meta_tier2) : null,
        meta_tier3: newKri.meta_tier3 ? parseFloat(newKri.meta_tier3) : null,
      };

      const { error } = await supabase
        .from('kris')
        .insert([kriData]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "KRI registrado com sucesso!",
      });

      setNewKri({
        nome: "",
        descricao: "",
        categoria: "",
        tipo_medicao: "",
        frequencia_medicao: "",
        meta_tier1: "",
        meta_tier2: "",
        meta_tier3: "",
        referencia_mercado: "",
        processo_id: "",
        responsavel: "",
        risco_id: ""
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao criar KRI:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o KRI",
        variant: "destructive",
      });
    }
  };

  const handleUpdateKri = async () => {
    try {
      const kriData = {
        ...editingKri,
        meta_tier1: editingKri.meta_tier1 ? parseFloat(editingKri.meta_tier1) : null,
        meta_tier2: editingKri.meta_tier2 ? parseFloat(editingKri.meta_tier2) : null,
        meta_tier3: editingKri.meta_tier3 ? parseFloat(editingKri.meta_tier3) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('kris')
        .update(kriData)
        .eq('id', editingKri.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "KRI atualizado com sucesso!",
      });

      setEditingKri(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar KRI:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o KRI",
        variant: "destructive",
      });
    }
  };

  // Função para filtrar KRIs
  const getFilteredKris = () => {
    return kris.filter(kri => {
      const matchesMacroProcess = macroProcessFilter.length === 0 || 
        (kri.processos && macroProcessFilter.includes(kri.processos.macro_processo));
      const matchesProcess = processFilter.length === 0 || 
        (kri.processos && processFilter.includes(kri.processos.nome));
      const matchesRisk = riskFilter.length === 0 || 
        (kri.riscos && riskFilter.includes(kri.riscos.nome));
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(kri.status);
      const matchesValidation = validationFilter.length === 0 || 
        validationFilter.includes(kri.validacao_etapa?.toString() || '0');
      
      return matchesMacroProcess && matchesProcess && matchesRisk && matchesStatus && matchesValidation;
    });
  };

  const filteredKris = getFilteredKris();

  const handleClearFilters = () => {
    setMacroProcessFilter([]);
    setProcessFilter([]);
    setRiskFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
  };

  const statusOptions = ["Ativo", "Inativo", "Em Desenvolvimento"];

  const getCategoryColor = (category) => {
    switch (category) {
      case "Operacional": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Financeiro": return "bg-green-100 text-green-800 border-green-200";
      case "Tecnológico": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Conformidade": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Estratégico": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownloadXLS = () => {
    const data = filteredKris.map(kri => ({
      'Código': kri.codigo || '',
      'Nome': kri.nome,
      'Categoria': kri.categoria,
      'Descrição': kri.descricao || '',
      'Status': kri.status,
      'Processo': kri.processos?.nome || '',
      'Macro Processo': kri.processos?.macro_processo || '',
      'Risco': kri.riscos?.nome || '',
      'Responsável': kri.responsavel || '',
      'Frequência Medição': kri.frequencia_medicao || '',
      'Tipo Medição': kri.tipo_medicao || '',
      'Meta Tier 1': kri.meta_tier1 || 0,
      'Meta Tier 2': kri.meta_tier2 || 0,
      'Meta Tier 3': kri.meta_tier3 || 0,
      'Validação Etapa': kri.validacao_etapa || 0,
      'Criado em': new Date(kri.created_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KRIs');
    XLSX.writeFile(wb, `kris_${new Date().toISOString().split('T')[0]}.xlsx`);
    
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
          if (!row['Nome'] || !row['Categoria']) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from('kris')
            .insert({
              nome: row['Nome'],
              categoria: row['Categoria'],
              descricao: row['Descrição'] || '',
              status: row['Status'] || 'Ativo',
              codigo: row['Código'] || '',
              responsavel: row['Responsável'] || '',
              frequencia_medicao: row['Frequência Medição'] || 'Mensal',
              tipo_medicao: row['Tipo Medição'] || 'Quantitativo',
              meta_tier1: parseFloat(row['Meta Tier 1']) || 0,
              meta_tier2: parseFloat(row['Meta Tier 2']) || 0,
              meta_tier3: parseFloat(row['Meta Tier 3']) || 0,
              validacao_etapa: parseInt(row['Validação Etapa']) || 0,
              project_info_id: null
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Erro ao inserir KRI:', row, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload concluído",
        description: `${successCount} KRIs importados com sucesso. ${errorCount} erros.`,
      });

      fetchData();
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Inativo": return "bg-red-100 text-red-800 border-red-200";
      case "Em Desenvolvimento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de KRIs</h2>
          <p className="text-slate-600">Key Risk Indicators - Indicadores Chave de Risco</p>
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
            onClick={() => document.getElementById('upload-kris-xls')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carga Massa XLS
          </Button>

          <input
            id="upload-kris-xls"
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleUploadXLS}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo KRI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Novo KRI</DialogTitle>
              <DialogDescription>
                Crie um novo indicador chave de risco vinculado a um risco específico
              </DialogDescription>
            </DialogHeader>
            

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="process">Processo *</Label>
                <Select value={newKri.processo_id} onValueChange={(value) => {
                  setNewKri({...newKri, processo_id: value, risco_id: ""});
                  // Filtrar riscos pelo processo selecionado
                  const processRisks = risks.filter(risk => risk.processos?.id === value);
                  setFilteredRisks(processRisks);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o processo" />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.id} - {process.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="riskLink">Risco Vinculado *</Label>
                <Select 
                  value={newKri.risco_id} 
                  onValueChange={(value) => setNewKri({...newKri, risco_id: value})}
                  disabled={!newKri.processo_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!newKri.processo_id ? "Selecione primeiro um processo" : "Selecione o risco que este KRI monitora"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRisks.map((risk) => (
                      <SelectItem key={risk.id} value={risk.id}>
                        {risk.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="kriName">Nome do KRI *</Label>
                <Input 
                  id="kriName" 
                  placeholder="Ex: Taxa de Disponibilidade do Sistema"
                  value={newKri.nome}
                  onChange={(e) => setNewKri({...newKri, nome: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={newKri.categoria} onValueChange={(value) => setNewKri({...newKri, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operacional">Operacional</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Tecnológico">Tecnológico</SelectItem>
                    <SelectItem value="Conformidade">Conformidade</SelectItem>
                    <SelectItem value="Estratégico">Estratégico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurement">Tipo de Medição *</Label>
                <Select value={newKri.tipo_medicao} onValueChange={(value) => setNewKri({...newKri, tipo_medicao: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como será medido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentual">Percentual (%)</SelectItem>
                    <SelectItem value="Valor">Valor Absoluto</SelectItem>
                    <SelectItem value="Contagem">Contagem</SelectItem>
                    <SelectItem value="Tempo">Tempo (horas/dias)</SelectItem>
                    <SelectItem value="Taxa">Taxa/Proporção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência de Medição *</Label>
                <Select value={newKri.frequencia_medicao} onValueChange={(value) => setNewKri({...newKri, frequencia_medicao: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Com que frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diária">Diária</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner">Responsável</Label>
                <Input 
                  id="owner" 
                  placeholder="Nome do responsável"
                  value={newKri.responsavel}
                  onChange={(e) => setNewKri({...newKri, responsavel: e.target.value})}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva como este KRI funciona e o que monitora"
                  value={newKri.descricao}
                  onChange={(e) => setNewKri({...newKri, descricao: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier1">Meta Tier 1 (Verde)</Label>
                <Input 
                  id="tier1" 
                  type="number"
                  step="0.01"
                  placeholder="Meta ideal"
                  value={newKri.meta_tier1}
                  onChange={(e) => setNewKri({...newKri, meta_tier1: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier2">Meta Tier 2 (Amarelo)</Label>
                <Input 
                  id="tier2" 
                  type="number"
                  step="0.01"
                  placeholder="Meta de atenção"
                  value={newKri.meta_tier2}
                  onChange={(e) => setNewKri({...newKri, meta_tier2: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier3">Meta Tier 3 (Vermelho)</Label>
                <Input 
                  id="tier3" 
                  type="number"
                  step="0.01"
                  placeholder="Meta crítica"
                  value={newKri.meta_tier3}
                  onChange={(e) => setNewKri({...newKri, meta_tier3: e.target.value})}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="reference">Referência de Mercado</Label>
                <Input 
                  id="reference" 
                  placeholder="Benchmarks ou padrões do setor"
                  value={newKri.referencia_mercado}
                  onChange={(e) => setNewKri({...newKri, referencia_mercado: e.target.value})}
                />
              </div>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateKri}
              disabled={!newKri.nome || !newKri.categoria || !newKri.tipo_medicao || !newKri.frequencia_medicao || !newKri.risco_id}
            >
              Registrar KRI
            </Button>
            </DialogContent>
          </Dialog>
          
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
        statusOptions={statusOptions}
        showRiskFilter={true}
        showValidationFilter={true}
      />

      {/* KRI Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total de KRIs</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{filteredKris.length}</div>
            <p className="text-sm text-slate-500">Indicadores registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">KRIs Ativos</CardTitle>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredKris.filter(k => k.status === "Ativo").length}
            </div>
            <p className="text-sm text-slate-500">Em monitoramento</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">KRIs Vinculados</CardTitle>
              <Target className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {filteredKris.filter(k => k.risco_id).length}
            </div>
            <p className="text-sm text-slate-500">Ligados a riscos</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Em Desenvolvimento</CardTitle>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {filteredKris.filter(k => k.status === "Em Desenvolvimento").length}
            </div>
            <p className="text-sm text-slate-500">Sendo implementados</p>
          </CardContent>
        </Card>
      </div>

      {/* KRI Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Indicadores Registrados</CardTitle>
          <CardDescription>Lista completa de KRIs e suas configurações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KRI</TableHead>
                  <TableHead>Risco Vinculado</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Processo</TableHead>
                  <TableHead>Tipo/Freq.</TableHead>
                  <TableHead>Metas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKris.map((kri) => (
                  <TableRow key={kri.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-800">{kri.nome}</div>
                        <div className="text-sm text-slate-500">{kri.responsavel || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {kri.riscos?.nome || 'Não vinculado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(kri.categoria)}>
                        {kri.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {kri.processos?.nome || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{kri.tipo_medicao}</div>
                        <div className="text-slate-500">{kri.frequencia_medicao}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {kri.meta_tier1 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{kri.meta_tier1}</span>
                          </div>
                        )}
                        {kri.meta_tier2 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>{kri.meta_tier2}</span>
                          </div>
                        )}
                        {kri.meta_tier3 && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>{kri.meta_tier3}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(kri.status)}>
                        {kri.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingKri({
                              ...kri,
                              meta_tier1: kri.meta_tier1?.toString() || "",
                              meta_tier2: kri.meta_tier2?.toString() || "",
                              meta_tier3: kri.meta_tier3?.toString() || ""
                            })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar KRI</DialogTitle>
                            <DialogDescription>
                              Atualize as informações do indicador
                            </DialogDescription>
                          </DialogHeader>
                          
                          {editingKri && (
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="editKriName">Nome do KRI</Label>
                                <Input 
                                  id="editKriName" 
                                  value={editingKri.nome}
                                  onChange={(e) => setEditingKri({...editingKri, nome: e.target.value})}
                                />
                              </div>

                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="editRiskLink">Risco Vinculado</Label>
                                <Select 
                                  value={editingKri.risco_id || ""} 
                                  onValueChange={(value) => setEditingKri({...editingKri, risco_id: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o risco" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {risks.map((risk) => (
                                      <SelectItem key={risk.id} value={risk.id}>
                                        {risk.nome} - {risk.processos?.nome || 'Sem processo'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="editCategory">Categoria</Label>
                                <Select 
                                  value={editingKri.categoria} 
                                  onValueChange={(value) => setEditingKri({...editingKri, categoria: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Operacional">Operacional</SelectItem>
                                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                                    <SelectItem value="Tecnológico">Tecnológico</SelectItem>
                                    <SelectItem value="Conformidade">Conformidade</SelectItem>
                                    <SelectItem value="Estratégico">Estratégico</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editStatus">Status</Label>
                                <Select 
                                  value={editingKri.status} 
                                  onValueChange={(value) => setEditingKri({...editingKri, status: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Ativo">Ativo</SelectItem>
                                    <SelectItem value="Inativo">Inativo</SelectItem>
                                    <SelectItem value="Em Desenvolvimento">Em Desenvolvimento</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editMeasurement">Tipo de Medição</Label>
                                <Select 
                                  value={editingKri.tipo_medicao} 
                                  onValueChange={(value) => setEditingKri({...editingKri, tipo_medicao: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Percentual">Percentual (%)</SelectItem>
                                    <SelectItem value="Valor">Valor Absoluto</SelectItem>
                                    <SelectItem value="Contagem">Contagem</SelectItem>
                                    <SelectItem value="Tempo">Tempo (horas/dias)</SelectItem>
                                    <SelectItem value="Taxa">Taxa/Proporção</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editFrequency">Frequência</Label>
                                <Select 
                                  value={editingKri.frequencia_medicao} 
                                  onValueChange={(value) => setEditingKri({...editingKri, frequencia_medicao: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Diária">Diária</SelectItem>
                                    <SelectItem value="Semanal">Semanal</SelectItem>
                                    <SelectItem value="Mensal">Mensal</SelectItem>
                                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                                    <SelectItem value="Anual">Anual</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editProcess">Processo</Label>
                                <Select 
                                  value={editingKri.processo_id || ""} 
                                  onValueChange={(value) => setEditingKri({...editingKri, processo_id: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o processo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {processes.map((process) => (
                                      <SelectItem key={process.id} value={process.id}>
                                        {process.id} - {process.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editOwner">Responsável</Label>
                                <Input 
                                  id="editOwner" 
                                  value={editingKri.responsavel || ""}
                                  onChange={(e) => setEditingKri({...editingKri, responsavel: e.target.value})}
                                />
                              </div>

                              <div className="col-span-2 space-y-2">
                                <Label htmlFor="editDescription">Descrição</Label>
                                <Textarea 
                                  id="editDescription" 
                                  value={editingKri.descricao || ""}
                                  onChange={(e) => setEditingKri({...editingKri, descricao: e.target.value})}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editTier1">Meta Tier 1 (Verde)</Label>
                                <Input 
                                  id="editTier1" 
                                  type="number"
                                  step="0.01"
                                  value={editingKri.meta_tier1}
                                  onChange={(e) => setEditingKri({...editingKri, meta_tier1: e.target.value})}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editTier2">Meta Tier 2 (Amarelo)</Label>
                                <Input 
                                  id="editTier2" 
                                  type="number"
                                  step="0.01"
                                  value={editingKri.meta_tier2}
                                  onChange={(e) => setEditingKri({...editingKri, meta_tier2: e.target.value})}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editTier3">Meta Tier 3 (Vermelho)</Label>
                                <Input 
                                  id="editTier3" 
                                  type="number"
                                  step="0.01"
                                  value={editingKri.meta_tier3}
                                  onChange={(e) => setEditingKri({...editingKri, meta_tier3: e.target.value})}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="editReference">Referência de Mercado</Label>
                                <Input 
                                  id="editReference" 
                                  value={editingKri.referencia_mercado || ""}
                                  onChange={(e) => setEditingKri({...editingKri, referencia_mercado: e.target.value})}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={handleUpdateKri}
                            >
                              Atualizar KRI
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setEditingKri(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KRIManagement;
