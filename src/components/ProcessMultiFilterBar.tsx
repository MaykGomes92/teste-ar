import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MultiSelect } from "@/components/ui/multi-select";

interface ProcessMultiFilterBarProps {
  estruturaFilter: string[];
  macroProcessFilter: string[];
  processFilter: string[];
  statusFilter: string[];
  validationFilter: string[];
  onEstruturaChange: (value: string[]) => void;
  onMacroProcessChange: (value: string[]) => void;
  onProcessChange: (value: string[]) => void;
  onStatusChange: (value: string[]) => void;
  onValidationChange: (value: string[]) => void;
  onClearFilters: () => void;
  statusOptions: string[];
  selectedProjectId?: string;
}

const ProcessMultiFilterBar = ({
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
}: ProcessMultiFilterBarProps) => {
  const [processes, setProcesses] = useState([]);
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [estruturas, setEstruturas] = useState([]);

  const validationSteps = [
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
    if (estruturaFilter.length === 0) {
      return macroProcesses;
    }
    const selectedEstruturas = estruturas.filter(e => estruturaFilter.includes(e.nome));
    return macroProcesses.filter(mp => 
      selectedEstruturas.some(e => e.id === mp.estrutura_id)
    );
  };

  // Filtrar processos baseado no macro processo selecionado
  const getFilteredProcesses = () => {
    const filteredMacroProcesses = getFilteredMacroProcesses();
    if (macroProcessFilter.length === 0) {
      return processes.filter(p => 
        filteredMacroProcesses.some(mp => mp.nome === p.macro_processo)
      );
    }
    return processes.filter(process => macroProcessFilter.includes(process.macro_processo));
  };

  const hasActiveFilters = () => {
    return estruturaFilter.length > 0 || 
           macroProcessFilter.length > 0 || 
           processFilter.length > 0 || 
           statusFilter.length > 0 ||
           validationFilter.length > 0;
  };

  const estruturaOptions = estruturas.map((estrutura) => ({
    value: estrutura.nome,
    label: estrutura.codigo ? `${estrutura.codigo} - ${estrutura.nome}` : `EST.${estrutura.id.substring(0,8)} - ${estrutura.nome}`
  }));

  const macroProcessOptions = getFilteredMacroProcesses().map((macroProcess) => ({
    value: macroProcess.nome,
    label: macroProcess.codigo ? `${macroProcess.codigo} - ${macroProcess.nome}` : `MP.${macroProcess.id.substring(0,8)} - ${macroProcess.nome}`
  }));

  const processOptions = getFilteredProcesses().map((process) => ({
    value: process.id,
    label: process.codigo ? `${process.codigo} - ${process.nome}` : `PR.${process.id.substring(0,8)} - ${process.nome}`
  }));

  const statusOptionsFormatted = statusOptions.map((status) => ({
    value: status,
    label: status
  }));

  const validationOptionsFormatted = validationSteps.map((step) => ({
    value: step.value,
    label: step.label
  }));

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
            <MultiSelect
              options={estruturaOptions}
              value={estruturaFilter}
              onChange={onEstruturaChange}
              placeholder="Estruturas"
              maxDisplayed={2}
            />
          </div>

          {/* Macro Processo */}
          <div className="min-w-48">
            <MultiSelect
              options={macroProcessOptions}
              value={macroProcessFilter}
              onChange={onMacroProcessChange}
              placeholder="Macro Processos"
              maxDisplayed={2}
            />
          </div>

          {/* Processo */}
          <div className="min-w-48">
            <MultiSelect
              options={processOptions}
              value={processFilter}
              onChange={onProcessChange}
              placeholder="Processos"
              maxDisplayed={2}
            />
          </div>

          {/* Status */}
          <div className="min-w-44">
            <MultiSelect
              options={statusOptionsFormatted}
              value={statusFilter}
              onChange={onStatusChange}
              placeholder="Status"
              maxDisplayed={2}
            />
          </div>

          {/* Validação */}
          <div className="min-w-52">
            <MultiSelect
              options={validationOptionsFormatted}
              value={validationFilter}
              onChange={onValidationChange}
              placeholder="Etapas de Validação"
              maxDisplayed={2}
            />
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
            {estruturaFilter.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Estruturas: {estruturaFilter.length}
              </span>
            )}
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
  );
};

export default ProcessMultiFilterBar;