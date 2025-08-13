import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProcessFilterBarProps {
  estruturaFilter: string;
  macroProcessFilter: string;
  processFilter: string;
  statusFilter: string;
  validationFilter: string;
  onEstruturaChange: (value: string) => void;
  onMacroProcessChange: (value: string) => void;
  onProcessChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onValidationChange: (value: string) => void;
  onClearFilters: () => void;
  statusOptions: string[];
  selectedProjectId?: string;
}

const ProcessFilterBar = ({
  estruturaFilter,
  macroProcessFilter,
  processFilter,
  statusFilter,
  validationFilter,
  onEstruturaChange,
  onMacroProcessChange,
  onProcessChange,
  onStatusChange,
  onValidationChange,
  onClearFilters,
  statusOptions,
  selectedProjectId
}: ProcessFilterBarProps) => {
  const [processes, setProcesses] = useState([]);
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [estruturas, setEstruturas] = useState([]);

  const validationSteps = [
    { value: "todos", label: "Todas as Etapas" },
    { value: "0", label: "0 - Não Iniciado" },
    { value: "1", label: "1 - Em desenvolvimento" },
    { value: "2", label: "2 - Em revisão" },
    { value: "3", label: "3 - Aprovação QA CI" },
    { value: "4", label: "4 - Aprovação Cliente" },
    { value: "5", label: "5 - Aprovação CI" },
    { value: "6", label: "6 - Concluído" }
  ];

  useEffect(() => {
    if (selectedProjectId) {
      fetchData();
    }
  }, [selectedProjectId]);

  const fetchData = async () => {
    if (!selectedProjectId) return;
    
    try {
      const [processesRes, macroProcessesRes, estruturasRes] = await Promise.all([
        supabase
          .from('processos')
          .select('*')
          .eq('project_info_id', selectedProjectId)
          .order('macro_processo, nome'),
        supabase
          .from('macro_processos')
          .select('*')
          .eq('project_info_id', selectedProjectId),
        supabase
          .from('estruturas_cadeia_valor')
          .select('*')
          .eq('project_info_id', selectedProjectId)
          .order('ordem')
      ]);
      
      if (processesRes.error) throw processesRes.error;
      if (macroProcessesRes.error) throw macroProcessesRes.error;
      if (estruturasRes.error) throw estruturasRes.error;
      
      setProcesses(processesRes.data || []);
      setMacroProcesses(macroProcessesRes.data || []);
      setEstruturas(estruturasRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados para filtros:', error);
    }
  };

  // Filtrar macro processos baseado na estrutura selecionada
  const getFilteredMacroProcesses = () => {
    if (estruturaFilter === "todos") {
      return macroProcesses;
    }
    const estrutura = estruturas.find(e => e.nome === estruturaFilter);
    return macroProcesses.filter(mp => mp.estrutura_id === estrutura?.id);
  };

  // Filtrar processos baseado no macro processo selecionado
  const getFilteredProcesses = () => {
    const filteredMacroProcesses = getFilteredMacroProcesses();
    if (macroProcessFilter === "todos") {
      return processes.filter(p => 
        filteredMacroProcesses.some(mp => mp.nome === p.macro_processo)
      );
    }
    return processes.filter(process => process.macro_processo === macroProcessFilter);
  };

  const hasActiveFilters = () => {
    return estruturaFilter !== "todos" || 
           macroProcessFilter !== "todos" || 
           processFilter !== "todos" || 
           statusFilter !== "todos" ||
           validationFilter !== "todos";
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filtros:</span>
          </div>

          {/* Estrutura da Cadeia de Valor */}
          <div className="min-w-48">
            <Select value={estruturaFilter} onValueChange={onEstruturaChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Estrutura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as Estruturas</SelectItem>
                {estruturas.map((estrutura) => (
                  <SelectItem key={estrutura.id} value={estrutura.nome}>
                    {estrutura.codigo ? `${estrutura.codigo} - ${estrutura.nome}` : `EST.${estrutura.id.substring(0,8)} - ${estrutura.nome}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Macro Processo */}
          <div className="min-w-48">
            <Select value={macroProcessFilter} onValueChange={onMacroProcessChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Macro Processo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Macro Processos</SelectItem>
                {getFilteredMacroProcesses().map((macroProcess) => (
                  <SelectItem key={macroProcess.id} value={macroProcess.nome}>
                    {macroProcess.codigo ? `${macroProcess.codigo} - ${macroProcess.nome}` : `MP.${macroProcess.id.substring(0,8)} - ${macroProcess.nome}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Processo */}
          <div className="min-w-48">
            <Select value={processFilter} onValueChange={onProcessChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Processo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Processos</SelectItem>
                {getFilteredProcesses().map((process) => (
                  <SelectItem key={process.id} value={process.id}>
                    {process.codigo ? `${process.codigo} - ${process.nome}` : `PR.${process.id.substring(0,8)} - ${process.nome}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="min-w-44">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Validação */}
          <div className="min-w-52">
            <Select value={validationFilter} onValueChange={onValidationChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Etapa de Validação" />
              </SelectTrigger>
              <SelectContent>
                {validationSteps.map((step) => (
                  <SelectItem key={step.value} value={step.value}>
                    {step.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Limpar Filtros */}
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-9 px-3"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Indicador de Filtros Ativos */}
        {hasActiveFilters() && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <span>Filtros ativos:</span>
            {estruturaFilter !== "todos" && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Estrutura: {estruturaFilter}
              </span>
            )}
            {macroProcessFilter !== "todos" && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Macro: {macroProcessFilter}
              </span>
            )}
            {processFilter !== "todos" && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Processo: {processFilter}
              </span>
            )}
            {statusFilter !== "todos" && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Status: {statusFilter}
              </span>
            )}
            {validationFilter !== "todos" && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                Validação: {validationSteps.find(s => s.value === validationFilter)?.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessFilterBar;