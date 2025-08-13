import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ControlDetailsDialogProps {
  control: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const ControlDetailsDialog = ({ control, open, onOpenChange, onUpdate }: ControlDetailsDialogProps) => {
  const [editMode, setEditMode] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    tipo_medicao: "",
    frequencia_medicao: "",
    processo_id: "",
    responsavel: "",
    descricao: "",
    status: "",
    validacao_etapa: 0,
    risco_id: ""
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

  const getValidationStepLabel = (step: number) => {
    const stepData = validationSteps.find(s => s.value === step);
    return stepData ? stepData.label : "Não Iniciado";
  };

  const statusOptions = ["Ativo", "Inativo", "Em Implementação", "Planejado"];
  const categoryOptions = ["Preventivo", "Detectivo", "Corretivo"];
  const frequencyOptions = ["Diário", "Semanal", "Mensal", "Trimestral", "Anual"];

  useEffect(() => {
    if (control) {
      setFormData({
        nome: control.nome || "",
        categoria: control.categoria || "",
        tipo_medicao: control.tipo_medicao || "",
        frequencia_medicao: control.frequencia_medicao || "",
        processo_id: control.processo_id || "",
        responsavel: control.responsavel || "",
        descricao: control.descricao || "",
        status: control.status || "",
        validacao_etapa: control.validacao_etapa || 0,
        risco_id: control.risco_id || ""
      });
    }
  }, [control]);

  useEffect(() => {
    fetchProcesses();
    fetchRisks();
  }, []);

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

  const fetchRisks = async () => {
    try {
      const { data, error } = await supabase
        .from('riscos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setRisks(data || []);
    } catch (error) {
      console.error('Erro ao buscar riscos:', error);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('kris')
        .update(formData)
        .eq('id', control.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Controle atualizado com sucesso!",
      });

      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar controle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o controle",
        variant: "destructive",
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800";
      case "Inativo": return "bg-red-100 text-red-800";
      case "Em Implementação": return "bg-yellow-100 text-yellow-800";
      case "Planejado": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!control) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Detalhes do Controle</span>
            <Badge className={getStatusColor(formData.status)}>
              {formData.status}
            </Badge>
            <Badge className={getValidationStepColor(formData.validacao_etapa)}>
              {getValidationStepLabel(formData.validacao_etapa)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Controle</Label>
              {editMode ? (
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{formData.nome}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              {editMode ? (
                <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{formData.categoria}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              {editMode ? (
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{formData.status}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Responsável</Label>
              {editMode ? (
                <Input
                  value={formData.responsavel}
                  onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{formData.responsavel}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Medição</Label>
              {editMode ? (
                <Input
                  value={formData.tipo_medicao}
                  onChange={(e) => setFormData({...formData, tipo_medicao: e.target.value})}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{formData.tipo_medicao}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Frequência</Label>
              {editMode ? (
                <Select value={formData.frequencia_medicao} onValueChange={(value) => setFormData({...formData, frequencia_medicao: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 bg-gray-50 rounded border">{formData.frequencia_medicao}</div>
              )}
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
                {formData.validacao_etapa} - {getValidationStepLabel(formData.validacao_etapa)}
              </div>
            )}
          </div>

          {/* Risco Associado */}
          <div className="space-y-2">
            <Label>Risco Associado</Label>
            {editMode ? (
              <Select value={formData.risco_id} onValueChange={(value) => setFormData({...formData, risco_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o risco" />
                </SelectTrigger>
                <SelectContent>
                  {risks.map((risk) => (
                    <SelectItem key={risk.id} value={risk.id}>
                      {risk.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded border">
                {control.riscos ? control.riscos.nome : "Não definido"}
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
                {control.processos ? `${control.processos.nome} (${control.processos.macro_processo})` : "Não definido"}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            {editMode ? (
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows={4}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded border min-h-[100px]">
                {formData.descricao}
              </div>
            )}
          </div>

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
                Editar Controle
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ControlDetailsDialog;