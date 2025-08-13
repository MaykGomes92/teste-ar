
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, CheckCircle, AlertCircle, Settings, Eye, Star, Download, Upload } from "lucide-react";
import ControlDetailsDialog from "./ControlDetailsDialog";
import ControlModal from "./ControlModal";
import HierarchicalFilterBar from "./HierarchicalFilterBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import * as XLSX from 'xlsx';

interface ControlsFrameworkProps {
  onProcessClick?: (processId: string) => void;
}

const ControlsFramework = ({ onProcessClick }: ControlsFrameworkProps) => {
  const [selectedControl, setSelectedControl] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [macroProcessFilter, setMacroProcessFilter] = useState([]);
  const [processFilter, setProcessFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [validationFilter, setValidationFilter] = useState([]);
  const [riskFilter, setRiskFilter] = useState([]);
  const [controlFilter, setControlFilter] = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();


  // Lista de riscos disponíveis (normalmente viria de uma API ou contexto)
  const availableRisks = [
    { id: 1, code: "R.001.4527", title: "Falha no Sistema de Pagamentos", processCode: "P-001" },
    { id: 2, code: "R.002.7391", title: "Fraude em Compras", processCode: "P-002" },
    { id: 3, code: "R.003.2859", title: "Perda de Dados Pessoais", processCode: "P-003" },
    { id: 4, code: "R.004.6142", title: "Atraso em Entregas", processCode: "P-004" },
    { id: 5, code: "R.005.9674", title: "Rotatividade de Pessoal Chave", processCode: "P-005" },
    { id: 6, code: "R.006.1835", title: "Mudança Regulatória", processCode: "P-006" }
  ];

  useEffect(() => {
    fetchControls();
  }, []);

  const fetchControls = async () => {
    try {
      const { data, error } = await supabase
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
            codigo,
            nome
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setControls(data || []);
    } catch (error) {
      console.error('Erro ao buscar controles:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os controles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar controles
  const getFilteredControls = () => {
    return controls.filter(control => {
      const matchesMacroProcess = macroProcessFilter.length === 0 || 
        (control.processos && macroProcessFilter.includes(control.processos.macro_processo));
      const matchesProcess = processFilter.length === 0 || 
        (control.processos && processFilter.includes(control.processos.nome));
      const matchesRisk = riskFilter.length === 0 || 
        (control.riscos && riskFilter.includes(control.riscos.nome));
      const matchesControl = controlFilter.length === 0 || 
        controlFilter.includes(control.nome);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(control.status);
      const matchesValidation = validationFilter.length === 0 || 
        validationFilter.includes(control.validacao_etapa?.toString() || '0');
      
      return matchesMacroProcess && matchesProcess && matchesRisk && matchesControl && matchesStatus && matchesValidation;
    });
  };

  const filteredControls = getFilteredControls();

  const handleClearFilters = () => {
    setMacroProcessFilter([]);
    setProcessFilter([]);
    setRiskFilter([]);
    setControlFilter([]);
    setStatusFilter([]);
    setValidationFilter([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Implementado": return "bg-green-100 text-green-800 border-green-200";
      case "Em Implementação": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Planejado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Descontinuado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alto": return "bg-red-100 text-red-800 border-red-200";
      case "Médio": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixo": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Preventivo": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Detectivo": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Corretivo": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
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
    const data = filteredControls.map(control => ({
      'Código': control.codigo || '',
      'Nome': control.nome,
      'Categoria': control.categoria,
      'Descrição': control.descricao || '',
      'Status': control.status,
      'Processo': control.processos?.nome || '',
      'Macro Processo': control.processos?.macro_processo || '',
      'Risco': control.riscos?.nome || '',
      'Responsável': control.responsavel || '',
      'Frequência Medição': control.frequencia_medicao || '',
      'Tipo Medição': control.tipo_medicao || '',
      'Validação Etapa': control.validacao_etapa || 0,
      'Criado em': new Date(control.created_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Controles');
    XLSX.writeFile(wb, `controles_${new Date().toISOString().split('T')[0]}.xlsx`);
    
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
              validacao_etapa: parseInt(row['Validação Etapa']) || 0,
              project_info_id: null
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Erro ao inserir controle:', row, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload concluído",
        description: `${successCount} controles importados com sucesso. ${errorCount} erros.`,
      });

      fetchControls();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Framework de Controles</h2>
          <p className="text-slate-600">Gestão e monitoramento dos controles internos</p>
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
            onClick={() => document.getElementById('upload-controls-xls')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Carga Massa XLS
          </Button>

          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setControlModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Controle
          </Button>
        </div>
      </div>

      <input
        id="upload-controls-xls"
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleUploadXLS}
      />

      {/* Filtros */}
      <HierarchicalFilterBar
        macroProcessFilter={macroProcessFilter}
        processFilter={processFilter}
        riskFilter={riskFilter}
        controlFilter={controlFilter}
        statusFilter={statusFilter}
        validationFilter={validationFilter}
        onMacroProcessChange={setMacroProcessFilter}
        onProcessChange={setProcessFilter}
        onRiskChange={setRiskFilter}
        onControlChange={setControlFilter}
        onStatusChange={setStatusFilter}
        onValidationChange={setValidationFilter}
        onClearFilters={handleClearFilters}
        statusOptions={["Ativo", "Inativo", "Em Desenvolvimento"]}
        showRiskFilter={true}
        showControlFilter={true}
        showValidationFilter={true}
      />

      {/* Controls Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Controles</CardTitle>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{filteredControls.length}</div>
            <p className="text-sm text-slate-500">Controles registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Implementados</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredControls.filter(c => c.status === "Ativo").length}
            </div>
            <p className="text-sm text-slate-500">
              {filteredControls.length > 0 ? Math.round((filteredControls.filter(c => c.status === "Ativo").length / filteredControls.length) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Efetividade Média</CardTitle>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {filteredControls.length > 0 ? Math.round((filteredControls.length / controls.length) * 100) : 0}%
            </div>
            <p className="text-sm text-slate-500">Score de efetividade</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Alta Prioridade</CardTitle>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {filteredControls.filter(c => c.categoria === "Operacional").length}
            </div>
            <p className="text-sm text-slate-500">Controles críticos</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls List */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Registro de Controles</CardTitle>
          <CardDescription>Lista detalhada de todos os controles implementados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredControls.map((control) => (
              <div key={control.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-slate-800">{control.nome}</h4>
                      <Badge className={getStatusColor(control.status)}>
                        {control.status}
                      </Badge>
                    </div>
                    
                    {/* Classificações na ordem: Macro Processo, Processo, Risco */}
                    <div className="flex items-center space-x-3 mb-2">
                      {control.processos?.macro_processo && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          Macro: {control.processos.macro_processo}
                        </Badge>
                      )}
                       {control.processos && (
                         <Badge 
                           className="bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200"
                           onClick={() => onProcessClick?.(control.processo_id)}
                         >
                           Processo: {control.processos.id || control.processo_id} - {control.processos.nome}
                         </Badge>
                       )}
                       {control.riscos && (
                         <Badge className="bg-red-100 text-red-800 border-red-200">
                           Risco: {control.riscos.codigo || control.risco_id} - {control.riscos.nome}
                         </Badge>
                       )}
                    </div>
                    
                    <p className="text-slate-600 text-sm">{control.descricao || 'Sem descrição'}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">Categoria:</span> {control.categoria}
                      </div>
                      <div>
                        <span className="font-medium">Frequência:</span> {control.frequencia_medicao || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Tipo Medição:</span> {control.tipo_medicao || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Responsável:</span> {control.responsavel || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{control.validacao_etapa || 0}</div>
                      <div className="text-xs text-slate-500">Etapa</div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="p-2"
                      onClick={() => {
                        setSelectedControl(control);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ControlDetailsDialog 
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        control={selectedControl}
        onUpdate={fetchControls}
      />

      <ControlModal 
        open={controlModalOpen}
        onOpenChange={setControlModalOpen}
        onSuccess={fetchControls}
      />
    </div>
  );
};

export default ControlsFramework;
