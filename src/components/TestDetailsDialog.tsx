import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, CheckCircle, Target, Edit } from "lucide-react";

interface TestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: any;
  onEdit?: () => void;
}

const TestDetailsDialog = ({ open, onOpenChange, test, onEdit }: TestDetailsDialogProps) => {
  if (!test) return null;

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

  const getStatusColor = (status: string) => {
    return status ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Detalhes do Teste: {test.nome}
            </DialogTitle>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-slate-600">Código:</span>
                  <p className="text-slate-800">{test.codigo || `TD.${test.id.substring(0,8)}`}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Nome:</span>
                  <p className="text-slate-800">{test.nome}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Descrição:</span>
                  <p className="text-slate-800">{test.descricao || 'Sem descrição'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Status:</span>
                  <Badge className={getStatusColor(test.data_execucao)}>
                    {test.data_execucao ? "Concluído" : "Pendente"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Execução</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-slate-600">Data de Execução:</span>
                  <p className="text-slate-800">
                    {test.data_execucao ? new Date(test.data_execucao).toLocaleDateString('pt-BR') : 'Não executado'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-slate-600">Executor:</span>
                  <p className="text-slate-800">{test.executor || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-slate-600">Revisor:</span>
                  <p className="text-slate-800">{test.revisor || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Etapa de Validação:</span>
                  <p className="text-slate-800">{test.validacao_etapa || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hierarquia */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Hierarquia</h3>
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          {/* Avaliações */}
          {(test.maturidade !== null || test.mitigacao !== null) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Avaliações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {test.maturidade !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-slate-600">Maturidade</span>
                    </div>
                    <Progress value={(test.maturidade || 0) * 25} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Nível {test.maturidade || 0}</span>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        {getMaturityLabel(test.maturidade || 0)}
                      </Badge>
                    </div>
                  </div>
                )}

                {test.mitigacao !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-slate-600">Mitigação</span>
                    </div>
                    <Progress value={(test.mitigacao || 0) * 25} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Nível {test.mitigacao || 0}</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {getMitigationLabel(test.mitigacao || 0)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Procedimento Realizado */}
          {test.procedimento_realizado && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Procedimento Realizado</h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-800">{test.procedimento_realizado}</p>
              </div>
            </div>
          )}

          {/* Evidências */}
          {test.evidencia_names && test.evidencia_names.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Evidências</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {test.evidencia_names.map((name: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-slate-800 truncate" title={name}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestDetailsDialog;