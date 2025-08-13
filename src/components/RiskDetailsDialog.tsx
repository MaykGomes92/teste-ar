import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { History } from "lucide-react";

interface RiskDetailsDialogProps {
  risk: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  startInEditMode?: boolean;
}

const RiskDetailsDialog = ({ risk, open, onOpenChange, onUpdate, startInEditMode = false }: RiskDetailsDialogProps) => {
  const [editMode, setEditMode] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    causas: "",
    consequencias: "",
    categoria: "",
    probabilidade: "",
    nivel_impacto: "",
    processo_id: "",
    responsavel: "",
    status: "",
    validacao_etapa: 0
  });
  const { toast } = useToast();

  const validationSteps = [
    { value: 0, label: "Não Iniciado" },
    { value: 1, label: "Em desenvolvimento" },
    { value: 2, label: "Em revisão" },
    { value: 3, label: "Aprovação QA CI" },
    { value: 4, label: "Aprovação Cliente" },
    { value: 5, label: "Aprovação CI" },
    { value: 6, label: "Concluído" }
  ];

  const statusOptions = ["Identificado", "Ativo", "Mitigado", "Em Monitoramento"];
  const categoryOptions = ["Operacional", "Financeiro", "Estratégico", "Conformidade", "Tecnológico", "Ambiental", "Reputacional"];
  const atualNovoOptions = ["Atual", "Novo"];
  const probabilidadeOptions = [
    { value: "1", label: "1 - Remoto" },
    { value: "2", label: "2 - Incerto" },
    { value: "3", label: "3 - Possível" },
    { value: "4", label: "4 - Provável" }
  ];
  const impactoOptions = [
    { value: "0", label: "0 - Não se aplica" },
    { value: "1", label: "1 - Baixo" },
    { value: "2", label: "2 - Moderado" },
    { value: "3", label: "3 - Significativo" },
    { value: "4", label: "4 - Crítico" }
  ];

  useEffect(() => {
    if (risk) {
      setFormData({
        nome: risk.nome || "",
        descricao: risk.descricao || "",
        causas: risk.causas || "",
        consequencias: risk.consequencias || "",
        categoria: risk.categoria || "",
        probabilidade: risk.probabilidade || "",
        nivel_impacto: risk.nivel_impacto || "",
        processo_id: risk.processo_id || "",
        responsavel: risk.responsavel || "",
        status: risk.status || "",
        validacao_etapa: risk.validacao_etapa || 0
      });
      fetchStatusLogs();
    }
  }, [risk]);

  useEffect(() => {
    fetchProcesses();
  }, []);

  useEffect(() => {
    if (startInEditMode && open) {
      setEditMode(true);
    } else if (!open) {
      setEditMode(false);
    }
  }, [startInEditMode, open]);

  const fetchStatusLogs = async () => {
    if (!risk?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_risk_status_logs', {
        risk_id: risk.id
      });
      
      if (error) {
        console.error('Erro ao buscar logs de status:', error);
        throw error;
      }
      
      setStatusLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar logs de status:', error);
    }
  };

  const fetchProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setProcesses(data || []);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    }
  };

  const handleSave = async () => {
    try {
      console.log('Dados sendo salvos:', formData);
      console.log('Risk ID:', risk.id);
      
      const { data, error } = await supabase
        .from('riscos')
        .update(formData)
        .eq('id', risk.id)
        .select();

      if (error) {
        console.error('Erro Supabase:', error);
        throw error;
      }

      console.log('Dados atualizados:', data);

      toast({
        title: "Sucesso",
        description: "Risco atualizado com sucesso!",
      });

      setEditMode(false);
      onUpdate();
      fetchStatusLogs(); // Recarregar logs após salvar
    } catch (error) {
      console.error('Erro ao atualizar risco:', error);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o risco: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getRiskLevel = (probabilidade: string, impacto: string) => {
    const probNum = parseInt(probabilidade) || 1;
    const impNum = parseInt(impacto) || 1;
    const score = probNum * impNum;
    
    if (score >= 15) return { level: "Crítico", color: "bg-red-600 text-white" };
    if (score >= 10) return { level: "Alto", color: "bg-red-400 text-white" };
    if (score >= 6) return { level: "Médio", color: "bg-yellow-400 text-gray-800" };
    return { level: "Baixo", color: "bg-green-400 text-white" };
  };

  const getValidationStepLabel = (step: number) => {
    const stepData = validationSteps.find(s => s.value === step);
    return stepData ? stepData.label : "Em Desenvolvimento";
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

  if (!risk) return null;

  const riskLevel = getRiskLevel(formData.probabilidade, formData.nivel_impacto);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Detalhes do Risco</span>
            <Badge className={riskLevel.color}>
              {riskLevel.level} ({parseInt(formData.probabilidade) * parseInt(formData.nivel_impacto)})
            </Badge>
            <Badge className={getValidationStepColor(formData.validacao_etapa)}>
              {getValidationStepLabel(formData.validacao_etapa)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 1. Código Antigo */}
          <div className="space-y-2">
            <Label>1. Código Antigo (Campo Livre)</Label>
            <div className="p-2 bg-gray-50 rounded border">{risk?.codigo || "Não informado"}</div>
          </div>

          {/* 2. Risco */}
          <div className="space-y-2">
            <Label>2. Risco</Label>
            {editMode ? (
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">{formData.nome}</div>
            )}
          </div>

          {/* Categorias e Pontuação abaixo do Nome do Risco */}
          <div className="bg-gray-50 p-3 rounded border">
            <h4 className="font-medium text-sm mb-2">Categorias e Pontuação:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {risk?.categorias_pontuacao && Object.keys(risk.categorias_pontuacao).length > 0 ? (
                Object.entries(risk.categorias_pontuacao).map(([categoria, pontuacao]) => (
                  <div key={categoria} className="flex justify-between items-center p-2 bg-white rounded text-sm">
                    <span className="font-medium">{categoria}</span>
                    <span className="text-gray-600">
                      {String(pontuacao)} - {impactoOptions.find(i => i.value === String(pontuacao))?.label.split(' - ')[1] || "N/A"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2 bg-white rounded text-gray-600 text-sm">
                  Nenhuma categoria definida
                </div>
              )}
            </div>
          </div>

          {/* 3. Descrição */}
          <div className="space-y-2">
            <Label>3. Descrição</Label>
            {editMode ? (
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded border min-h-[80px]">
                {formData.descricao || "Não informado"}
              </div>
            )}
          </div>

          {/* 4. Causas */}
          <div className="space-y-2">
            <Label>4. Causas</Label>
            {editMode ? (
              <Textarea
                value={formData.causas}
                onChange={(e) => setFormData({...formData, causas: e.target.value})}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded border min-h-[80px]">
                {formData.causas || "Não informado"}
              </div>
            )}
          </div>

          {/* 5. Consequências */}
          <div className="space-y-2">
            <Label>5. Consequências</Label>
            {editMode ? (
              <Textarea
                value={formData.consequencias}
                onChange={(e) => setFormData({...formData, consequencias: e.target.value})}
                rows={3}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded border min-h-[80px]">
                {formData.consequencias || "Não informado"}
              </div>
            )}
          </div>

          {/* 6. Atual ou Novo */}
          <div className="space-y-2">
            <Label>6. Atual ou Novo</Label>
            <div className="p-2 bg-gray-50 rounded border">{risk?.atual_novo || "Atual"}</div>
          </div>

          {/* 7. Validado por */}
          <div className="space-y-2">
            <Label>7. Validado por (e-mail de quem validou)</Label>
            <div className="p-2 bg-gray-50 rounded border">Não disponível para edição</div>
          </div>

          {/* 8. Caixa de Classificação do Risco */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-4">8. Classificação do Risco</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* a) Probabilidade */}
              <div className="space-y-2">
                <Label>a) Probabilidade</Label>
                {editMode ? (
                  <Select value={formData.probabilidade} onValueChange={(value) => setFormData({...formData, probabilidade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {probabilidadeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-white rounded border">
                    {probabilidadeOptions.find(p => p.value === formData.probabilidade)?.label || "Não definido"}
                  </div>
                )}
              </div>

              {/* b) Classificação do Impacto */}
              <div className="space-y-2">
                <Label>b) Classificação do Impacto</Label>
                {editMode ? (
                  <Select value={formData.nivel_impacto} onValueChange={(value) => setFormData({...formData, nivel_impacto: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {impactoOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-white rounded border">
                    {impactoOptions.find(i => i.value === formData.nivel_impacto)?.label || "Não definido"}
                  </div>
                )}
              </div>
            </div>

            {/* c) Cálculo dos Níveis */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <Label className="text-sm font-medium">Nível da Probabilidade:</Label>
                <div className="text-lg font-bold text-blue-600 mt-1">
                  {formData.probabilidade || "0"}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <Label className="text-sm font-medium">Nível de Impacto:</Label>
                <div className="text-lg font-bold text-green-600 mt-1">
                  {risk?.impacto_calculado !== undefined ? risk.impacto_calculado : (formData.nivel_impacto || "0")}
                </div>
              </div>
            </div>
          </div>

          {/* 9. Impacto Considerado */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-medium text-green-800 mb-2">9. Impacto Considerado</h3>
            <div className="bg-white p-3 rounded border">
              <div className="text-center">
                <span className="text-sm text-gray-600">Nível Maior Pontuação Impacto:</span>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {risk?.impacto_calculado !== undefined ? risk.impacto_calculado : (formData.nivel_impacto || "0")}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {risk?.impacto_calculado !== undefined ? 
                    impactoOptions.find(i => i.value === String(risk.impacto_calculado))?.label.split(' - ')[1] || "N/A" :
                    impactoOptions.find(i => i.value === formData.nivel_impacto)?.label.split(' - ')[1] || "Não definido"
                  }
                </div>
              </div>
            </div>
          </div>

          {/* 10. Nível do Risco */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-lg font-medium text-red-800 mb-2">10. Nível do Risco</h3>
            <div className="bg-white p-3 rounded border">
              <div className="text-center">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Probabilidade:</span>
                  <span className="font-bold">{formData.probabilidade || "0"}</span>
                  <span className="text-gray-400">×</span>
                  <span className="text-sm text-gray-600">Impacto:</span>
                  <span className="font-bold">{risk?.impacto_calculado !== undefined ? risk.impacto_calculado : (formData.nivel_impacto || "0")}</span>
                </div>
                <Badge className={riskLevel.color + " text-lg px-4 py-2"}>
                  {riskLevel.level}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">
                  Score: {(parseInt(formData.probabilidade) || 0) * (risk?.impacto_calculado !== undefined ? risk.impacto_calculado : (parseInt(formData.nivel_impacto) || 0))}
                </div>
              </div>
            </div>
          </div>

          {/* Etapa de Validação */}
          <div className="space-y-2">
            <Label>Etapa de Validação</Label>
            {editMode ? (
              <Select 
                value={formData.validacao_etapa.toString()} 
                onValueChange={(value) => setFormData({...formData, validacao_etapa: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {validationSteps.map((step) => (
                    <SelectItem key={step.value} value={step.value.toString()}>
                      {step.value} - {step.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                <Badge className={getValidationStepColor(formData.validacao_etapa)}>
                  {getValidationStepLabel(formData.validacao_etapa)}
                </Badge>
              </div>
            )}
          </div>

          {/* Processo */}
          <div className="space-y-2">
            <Label>Processo</Label>
            {editMode ? (
              <Select value={formData.processo_id} onValueChange={(value) => setFormData({...formData, processo_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((process) => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.nome} ({process.macro_processo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {risk.processos ? `${risk.processos.nome} (${risk.processos.macro_processo})` : "Não definido"}
              </div>
            )}
          </div>

          {/* Histórico de Mudanças de Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="w-4 h-4" />
                Histórico de Mudanças de Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusLogs.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {statusLogs.map((log, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Status: {getValidationStepLabel(log.status_anterior || 0)} → {getValidationStepLabel(log.status_novo)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Alterado por: {log.created_by_name || 'Sistema'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={getValidationStepColor(log.status_anterior || 0)} variant="outline">
                            {log.status_anterior || 0}
                          </Badge>
                          <span className="text-gray-400">→</span>
                          <Badge className={getValidationStepColor(log.status_novo)}>
                            {log.status_novo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600 p-2">Nenhuma mudança de status registrada</div>
              )}
            </CardContent>
          </Card>

          {/* Informações de Arquivamento */}
          {risk?.archived && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm text-orange-800">Risco Arquivado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-orange-700">
                  <div>Arquivado em: {risk.archived_at ? format(new Date(risk.archived_at), 'dd/MM/yyyy HH:mm') : 'Data não disponível'}</div>
                  <div>Arquivado por: Sistema</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4 border-t">
            {editMode ? (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)} className="bg-blue-600 hover:bg-blue-700">
                Editar Risco
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskDetailsDialog;