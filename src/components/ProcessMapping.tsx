import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building, Eye, Edit, FileText, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ProcessDetailsDialog from "./ProcessDetailsDialog";

interface ProcessMappingProps {
  selectedProcessId?: string;
  selectedProject?: string;
  selectedProjectId?: string;
  onModuleNavigate?: (module: string) => void;
}

const ProcessMapping = ({ selectedProcessId, selectedProject, selectedProjectId, onModuleNavigate }: ProcessMappingProps) => {
  const [loading, setLoading] = useState(true);
  const [processos, setProcessos] = useState([]);
  const [filteredProcessos, setFilteredProcessos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMacroProcesso, setSelectedMacroProcesso] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedValidationStep, setSelectedValidationStep] = useState("all");
  const [macroProcessos, setMacroProcessos] = useState([]);
  const [selectedProcessIdForDialog, setSelectedProcessIdForDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const projectId = selectedProjectId || 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';

  useEffect(() => {
    loadProcessosData();
  }, []);

  useEffect(() => {
    filterProcessos();
  }, [searchTerm, selectedMacroProcesso, selectedStatus, selectedValidationStep, processos]);

  const loadProcessosData = async () => {
    try {
      setLoading(true);
      
      // Carregar processos
      const { data: processosData, error: processosError } = await supabase
        .from('processos')
        .select('*')
        .eq('project_info_id', projectId)
        .order('nome');

      if (processosError) throw processosError;

      // Carregar macro processos para filtros
      const { data: macroData, error: macroError } = await supabase
        .from('macro_processos')
        .select('*')
        .eq('project_info_id', projectId)
        .order('nome');

      if (macroError) throw macroError;

      setProcessos(processosData || []);
      setMacroProcessos(macroData || []);
      
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os processos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProcessos = () => {
    let filtered = processos;

    // Filtro por texto de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(processo => 
        processo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.macro_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por macro processo
    if (selectedMacroProcesso !== "all") {
      filtered = filtered.filter(processo => processo.macro_processo === selectedMacroProcesso);
    }

    // Filtro por status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(processo => processo.status === selectedStatus);
    }

    // Filtro por etapa de validação
    if (selectedValidationStep !== "all") {
      const stepValue = parseInt(selectedValidationStep);
      filtered = filtered.filter(processo => (processo.validacao_etapa || 0) === stepValue);
    }

    setFilteredProcessos(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Inativo": return "bg-red-100 text-red-800 border-red-200";
      case "Em Desenvolvimento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getValidationStepLabel = (step: number) => {
    switch (step) {
      case 0: return "Não Iniciado";
      case 1: return "Em desenvolvimento";
      case 2: return "Em revisão";
      case 3: return "Aprovação QA CI";
      case 4: return "Aprovação Cliente";
      case 5: return "Aprovação CI";
      case 6: return "Concluído";
      default: return "Não Iniciado";
    }
  };

  const getValidationStepColor = (step: number) => {
    switch (step) {
      case 0: return "bg-gray-100 text-gray-800";
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-orange-100 text-orange-800";
      case 4: return "bg-purple-100 text-purple-800";
      case 5: return "bg-green-100 text-green-800";
      case 6: return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando processos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Mapeamento de Processos
          </h2>
          <p className="text-slate-600">
            Total de {processos.length} processos cadastrados e vinculados à cadeia de valor
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Processos
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para localizar processos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Filtro de Pesquisa */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pesquisar</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Nome, descrição, código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* Filtro por Macro Processo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Macro Processo</label>
              <Select value={selectedMacroProcesso} onValueChange={setSelectedMacroProcesso}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="all" className="hover:bg-gray-100">Todos os Macro Processos</SelectItem>
                  {macroProcessos.map(macro => (
                    <SelectItem 
                      key={macro.id} 
                      value={macro.nome}
                      className="hover:bg-gray-100"
                    >
                      {macro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="all" className="hover:bg-gray-100">Todos os Status</SelectItem>
                  <SelectItem value="Ativo" className="hover:bg-gray-100">Ativo</SelectItem>
                  <SelectItem value="Inativo" className="hover:bg-gray-100">Inativo</SelectItem>
                  <SelectItem value="Em Desenvolvimento" className="hover:bg-gray-100">Em Desenvolvimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Etapa de Validação */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Etapa de Validação</label>
              <Select value={selectedValidationStep} onValueChange={setSelectedValidationStep}>
                <SelectTrigger className="bg-white border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  <SelectItem value="all" className="hover:bg-gray-100">Todas as Etapas</SelectItem>
                  <SelectItem value="0" className="hover:bg-gray-100">Não Iniciado</SelectItem>
                  <SelectItem value="1" className="hover:bg-gray-100">Em desenvolvimento</SelectItem>
                  <SelectItem value="2" className="hover:bg-gray-100">Em revisão</SelectItem>
                  <SelectItem value="3" className="hover:bg-gray-100">Aprovação QA CI</SelectItem>
                  <SelectItem value="4" className="hover:bg-gray-100">Aprovação Cliente</SelectItem>
                  <SelectItem value="5" className="hover:bg-gray-100">Aprovação CI</SelectItem>
                  <SelectItem value="6" className="hover:bg-gray-100">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Ação dos Filtros */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedMacroProcesso("all");
                setSelectedStatus("all");
                setSelectedValidationStep("all");
              }}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Limpar Filtros
            </Button>
            <div className="text-sm text-gray-500 ml-auto">
              Mostrando {filteredProcessos.length} de {processos.length} processos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Processos em Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Processos Mapeados ({filteredProcessos.length} de {processos.length})
          </CardTitle>
          <CardDescription>
            Visualização em cards dos processos mapeados e vinculados à cadeia de valor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProcessos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProcessos.map((processo) => (
                <Card key={processo.id} className="relative group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-xs mb-2 bg-blue-50 text-blue-700 border-blue-200">
                          {processo.id}
                        </Badge>
                        <CardTitle className="text-sm font-semibold leading-tight text-slate-800 mb-1">
                          {processo.nome}
                        </CardTitle>
                      </div>
                    </div>
                    
                    {processo.descricao && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {processo.descricao}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    {/* Macro Processo */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">
                        {processo.macro_processo}
                      </span>
                    </div>

                    {/* Responsável */}
                    {processo.responsavel && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-600 truncate">
                          {processo.responsavel}
                        </span>
                      </div>
                    )}

                    {/* Status e Validação */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Status:</span>
                        <Badge className={`text-xs ${getStatusColor(processo.status)}`}>
                          {processo.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Validação:</span>
                        <Badge className={`text-xs ${getValidationStepColor(processo.validacao_etapa || 0)}`}>
                          {getValidationStepLabel(processo.validacao_etapa || 0)}
                        </Badge>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => setSelectedProcessIdForDialog(processo.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          onClick={() => {
                            toast({
                              title: "Editar Processo",
                              description: `Editando: ${processo.nome}`,
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {processo.bpmn_diagram_path && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                            onClick={() => {
                              toast({
                                title: "Diagrama BPMN",
                                description: `Visualizando diagrama: ${processo.nome}`,
                              });
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Indicadores visuais */}
                      <div className="flex items-center gap-1">
                        {processo.bpmn_diagram_path && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full" title="Possui diagrama BPMN"></div>
                        )}
                        {processo.attachment_paths?.length > 0 && (
                          <div className="w-2 h-2 bg-green-400 rounded-full" title="Possui anexos"></div>
                        )}
                        {(processo.validacao_etapa || 0) === 6 && (
                          <div className="w-2 h-2 bg-emerald-400 rounded-full" title="Processo concluído"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum processo encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Não foram encontrados processos com os filtros aplicados.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMacroProcesso("all");
                  setSelectedStatus("all");
                  setSelectedValidationStep("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Details Dialog */}
      {selectedProcessIdForDialog && (
        <ProcessDetailsDialog
          isOpen={!!selectedProcessIdForDialog}
          onClose={() => setSelectedProcessIdForDialog(null)}
          process={processos.find(p => p.id === selectedProcessIdForDialog)}
        />
      )}
    </div>
  );
};

export default ProcessMapping;