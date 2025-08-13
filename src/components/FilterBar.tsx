
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterBarProps {
  macroProcessFilter: string;
  processFilter: string;
  statusFilter: string;
  onMacroProcessChange: (value: string) => void;
  onProcessChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  statusOptions: string[];
  showMacroProcess?: boolean;
  processes?: Array<{
    id: string;
    nome: string;
    macro_processo: string;
    codigo?: string;
  }>;
}

const FilterBar = ({
  macroProcessFilter,
  processFilter,
  statusFilter,
  onMacroProcessChange,
  onProcessChange,
  onStatusChange,
  onClearFilters,
  statusOptions,
  showMacroProcess = true,
  processes = []
}: FilterBarProps) => {
  const macroProcessos = [
    "Processos Primários",
    "Processos de Apoio", 
    "Processos de Gestão"
  ];

  const hasActiveFilters = macroProcessFilter !== "todos" || processFilter !== "todos" || statusFilter !== "todos";

  // Get unique processes for the dropdown
  const uniqueProcesses = processes.reduce((acc, process) => {
    if (!acc.find(p => p.id === process.id)) {
      acc.push(process);
    }
    return acc;
  }, [] as typeof processes);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Filtros:</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {showMacroProcess && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Macro Processo</label>
            <Select value={macroProcessFilter} onValueChange={onMacroProcessChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {macroProcessos.map((macro) => (
                  <SelectItem key={macro} value={macro}>
                    {macro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Processo</label>
          <Select value={processFilter} onValueChange={onProcessChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
               {uniqueProcesses.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.codigo ? `${process.codigo} - ${process.nome}` : `${process.id} - ${process.nome}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Status</label>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Filtros ativos:</span>
          {macroProcessFilter !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              Macro: {macroProcessFilter}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-xs"
                onClick={() => onMacroProcessChange("todos")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {processFilter !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              Processo: {uniqueProcesses.find(p => p.id === processFilter)?.nome || processFilter}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-xs"
                onClick={() => onProcessChange("todos")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {statusFilter !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-xs"
                onClick={() => onStatusChange("todos")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
