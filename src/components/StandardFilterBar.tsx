import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MultiSelect } from "@/components/ui/multi-select";

interface StandardFilterBarProps {
  macroProcessFilter: string[];
  processFilter: string[];
  riskFilter?: string[];
  controlFilter?: string[];
  kriFilter?: string[];
  improvementFilter?: string[];
  testFilter?: string[];
  statusFilter: string[];
  validationFilter?: string[];
  onMacroProcessChange: (value: string[]) => void;
  onProcessChange: (value: string[]) => void;
  onRiskChange?: (value: string[]) => void;
  onControlChange?: (value: string[]) => void;
  onKriChange?: (value: string[]) => void;
  onImprovementChange?: (value: string[]) => void;
  onTestChange?: (value: string[]) => void;
  onStatusChange: (value: string[]) => void;
  onValidationChange?: (value: string[]) => void;
  onClearFilters: () => void;
  statusOptions: string[];
  showRiskFilter?: boolean;
  showControlFilter?: boolean;
  showKriFilter?: boolean;
  showImprovementFilter?: boolean;
  showTestFilter?: boolean;
  showValidationFilter?: boolean;
  refreshTrigger?: number;
}

const StandardFilterBar = ({
  macroProcessFilter,
  processFilter,
  riskFilter = [],
  controlFilter = [],
  kriFilter = [],
  improvementFilter = [],
  testFilter = [],
  statusFilter,
  validationFilter = [],
  onMacroProcessChange,
  onProcessChange,
  onRiskChange,
  onControlChange,
  onKriChange,
  onImprovementChange,
  onTestChange,
  onStatusChange,
  onValidationChange,
  onClearFilters,
  statusOptions,
  showRiskFilter = false,
  showControlFilter = false,
  showKriFilter = false,
  showImprovementFilter = false,
  showTestFilter = false,
  showValidationFilter = false,
  refreshTrigger
}: StandardFilterBarProps) => {
  const [processes, setProcesses] = useState([]);
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [controls, setControls] = useState([]);
  const [kris, setKris] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [tests, setTests] = useState([]);

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
    fetchProcesses();
  }, []);

  // Recarregar quando refreshTrigger mudar
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchProcesses();
    }
  }, [refreshTrigger]);

  // Adicionar listener para recarregar quando a página recebe foco
  useEffect(() => {
    const handleFocus = () => {
      fetchProcesses();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchProcesses = async () => {
    try {
      const [processesRes, macroProcessesRes, risksRes, controlsRes, krisRes, improvementsRes, testsRes] = await Promise.all([
        supabase.from('processos').select('*').order('macro_processo, nome'),
        supabase.from('macro_processos').select('*').order('nome'),
        supabase.from('riscos').select('*').order('nome'),
        supabase.from('kris').select('*').eq('categoria', 'Controle').order('nome'),
        supabase.from('kris').select('*').eq('categoria', 'KRI').order('nome'),
        supabase.from('melhorias').select('*').order('nome'),
        supabase.from('testes').select('*').order('nome')
      ]);
      
      if (processesRes.error) throw processesRes.error;
      if (macroProcessesRes.error) throw macroProcessesRes.error;
      if (risksRes.error) throw risksRes.error;
      if (controlsRes.error) throw controlsRes.error;
      if (krisRes.error) throw krisRes.error;
      if (improvementsRes.error) throw improvementsRes.error;
      if (testsRes.error) throw testsRes.error;
      
      setProcesses(processesRes.data || []);
      setMacroProcesses(macroProcessesRes.data || []);
      setRisks(risksRes.data || []);
      setControls(controlsRes.data || []);
      setKris(krisRes.data || []);
      setImprovements(improvementsRes.data || []);
      setTests(testsRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  // Filtrar processos baseado no macro processo selecionado
  const getFilteredProcesses = () => {
    if (macroProcessFilter.length === 0) {
      return processes;
    }
    return processes.filter(process => macroProcessFilter.includes(process.macro_processo));
  };

  const hasActiveFilters = () => {
    return macroProcessFilter.length > 0 || 
           processFilter.length > 0 || 
           (showRiskFilter && riskFilter.length > 0) ||
           (showControlFilter && controlFilter.length > 0) ||
           (showKriFilter && kriFilter.length > 0) ||
           (showImprovementFilter && improvementFilter.length > 0) ||
           (showTestFilter && testFilter.length > 0) ||
           statusFilter.length > 0 ||
           (showValidationFilter && validationFilter.length > 0);
  };

  return (
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
              options={macroProcesses.map((macroProcess) => ({
                value: macroProcess.nome,
                label: macroProcess.codigo ? `${macroProcess.codigo} - ${macroProcess.nome}` : `MP.${macroProcess.id.substring(0,8)} - ${macroProcess.nome}`
              }))}
              value={macroProcessFilter}
              onChange={onMacroProcessChange}
              placeholder="Macro Processos"
              className="h-9"
            />
          </div>

          {/* Processo */}
          <div className="min-w-48">
            <MultiSelect
              options={getFilteredProcesses().map((process) => ({
                value: process.nome,
                label: process.codigo ? `${process.codigo} - ${process.nome}` : `PR.${process.id.substring(0,8)} - ${process.nome}`
              }))}
              value={processFilter}
              onChange={onProcessChange}
              placeholder="Processos"
              className="h-9"
            />
          </div>

          {/* Status */}
          <div className="min-w-44">
            <MultiSelect
              options={statusOptions.map((status) => ({
                value: status,
                label: status
              }))}
              value={statusFilter}
              onChange={onStatusChange}
              placeholder="Status"
              className="h-9"
            />
          </div>

          {/* Riscos */}
          {showRiskFilter && onRiskChange && (
            <div className="min-w-48">
              <MultiSelect
                options={risks.map((risk) => ({
                  value: risk.nome,
                  label: risk.codigo ? `${risk.codigo} - ${risk.nome}` : `RI.${risk.id.substring(0,8)} - ${risk.nome}`
                }))}
                value={riskFilter}
                onChange={onRiskChange}
                placeholder="Riscos"
                className="h-9"
              />
            </div>
          )}

          {/* Controles */}
          {showControlFilter && onControlChange && (
            <div className="min-w-48">
              <MultiSelect
                options={controls.map((control) => ({
                  value: control.nome,
                  label: control.codigo ? `${control.codigo} - ${control.nome}` : `CT.${control.id.substring(0,8)} - ${control.nome}`
                }))}
                value={controlFilter}
                onChange={onControlChange}
                placeholder="Controles"
                className="h-9"
              />
            </div>
          )}

          {/* KRIs */}
          {showKriFilter && onKriChange && (
            <div className="min-w-48">
              <MultiSelect
                options={kris.map((kri) => ({
                  value: kri.nome,
                  label: kri.codigo ? `${kri.codigo} - ${kri.nome}` : `KRI.${kri.id.substring(0,8)} - ${kri.nome}`
                }))}
                value={kriFilter}
                onChange={onKriChange}
                placeholder="KRIs"
                className="h-9"
              />
            </div>
          )}

          {/* Melhorias */}
          {showImprovementFilter && onImprovementChange && (
            <div className="min-w-48">
              <MultiSelect
                options={improvements.map((improvement) => ({
                  value: improvement.nome,
                  label: improvement.codigo ? `${improvement.codigo} - ${improvement.nome}` : `ME.${improvement.id.substring(0,8)} - ${improvement.nome}`
                }))}
                value={improvementFilter}
                onChange={onImprovementChange}
                placeholder="Melhorias"
                className="h-9"
              />
            </div>
          )}

          {/* Testes */}
          {showTestFilter && onTestChange && (
            <div className="min-w-48">
              <MultiSelect
                options={tests.map((test) => ({
                  value: test.nome,
                  label: test.codigo ? `${test.codigo} - ${test.nome}` : `TE.${test.id.substring(0,8)} - ${test.nome}`
                }))}
                value={testFilter}
                onChange={onTestChange}
                placeholder="Testes"
                className="h-9"
              />
            </div>
          )}

          {/* Validação (opcional) */}
          {showValidationFilter && onValidationChange && (
            <div className="min-w-52">
              <MultiSelect
                options={validationSteps.map((step) => ({
                  value: step.value,
                  label: step.label
                }))}
                value={validationFilter}
                onChange={onValidationChange}
                placeholder="Etapas de Validação"
                className="h-9"
              />
            </div>
          )}

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
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 flex-wrap">
            <span>Filtros ativos:</span>
            {macroProcessFilter.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Macro: {macroProcessFilter.length} selecionado(s)
              </span>
            )}
            {processFilter.length > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Processo: {processFilter.length} selecionado(s)
              </span>
            )}
            {showRiskFilter && riskFilter.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                Risco: {riskFilter.length} selecionado(s)
              </span>
            )}
            {showControlFilter && controlFilter.length > 0 && (
              <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs">
                Controle: {controlFilter.length} selecionado(s)
              </span>
            )}
            {showKriFilter && kriFilter.length > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                KRI: {kriFilter.length} selecionado(s)
              </span>
            )}
            {showImprovementFilter && improvementFilter.length > 0 && (
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                Melhoria: {improvementFilter.length} selecionado(s)
              </span>
            )}
            {showTestFilter && testFilter.length > 0 && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                Teste: {testFilter.length} selecionado(s)
              </span>
            )}
            {statusFilter.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Status: {statusFilter.length} selecionado(s)
              </span>
            )}
            {showValidationFilter && validationFilter.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Validação: {validationFilter.length} selecionado(s)
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StandardFilterBar;