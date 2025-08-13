import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateControlCode } from "@/lib/utils";

interface ControlModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ControlModal = ({ open, onOpenChange, onSuccess }: ControlModalProps) => {
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [formData, setFormData] = useState({
    macro_processo: "",
    processo_id: "",
    risco_id: "",
    nome: "",
    objetivo: "",
    descricao: "",
    atividade: "",
    forma_atuacao: "",
    forma_execucao: "",
    periodicidade: "",
    prioridade: "",
    categoria: "",
    tipo_medicao: "",
    frequencia_medicao: "",
    responsavel: "",
    status: "Ativo",
    validacao_etapa: 0
  });
  const [loading, setLoading] = useState(false);
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

  const categoryOptions = ["Preventivo", "Detectivo", "Corretivo"];
  const statusOptions = ["Ativo", "Inativo", "Em Implementação", "Planejado"];
  const frequencyOptions = ["Diário", "Semanal", "Mensal", "Trimestral", "Anual"];
  const formaExecucaoOptions = ["Manual", "Semiautomático", "Automático"];
  const periodicidadeOptions = ["Anual", "Semestral", "Trimestral", "Bimestral", "Mensal", "Quinzenal", "Semanal", "Diário", "Várias vezes ao dia", "Sob Demanda"];
  const prioridadeOptions = ["Primário", "Secundário"];
  const responsavelOptions = ["Gerência Executiva", "Gerência Operacional", "Gerência Administrativa", "Gerência Financeira", "Gerência de TI"];

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [processesRes, risksRes] = await Promise.all([
        supabase.from('processos').select('*').order('nome'),
        supabase.from('riscos').select('*').order('nome')
      ]);

      if (processesRes.error) throw processesRes.error;
      if (risksRes.error) throw risksRes.error;

      setProcesses(processesRes.data || []);
      setRisks(risksRes.data || []);
      
      // Extrair macro processos únicos
      const uniqueMacroProcesses = [...new Set(processesRes.data?.map(p => p.macro_processo) || [])];
      setMacroProcesses(uniqueMacroProcesses);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    }
  };

  const handleMacroProcessChange = (macroProcess: string) => {
    setFormData({...formData, macro_processo: macroProcess, processo_id: "", risco_id: ""});
    
    // Filtrar processos pelo macro processo selecionado
    const processesFiltered = processes.filter(process => process.macro_processo === macroProcess);
    setFilteredProcesses(processesFiltered);
    setFilteredRisks([]);
  };

  const handleProcessChange = (processId: string) => {
    setFormData({...formData, processo_id: processId, risco_id: ""});
    
    // Filtrar riscos pelo processo selecionado
    const processRisks = risks.filter(risk => risk.processo_id === processId);
    setFilteredRisks(processRisks);
  };


  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar o risco selecionado para gerar o código
      const selectedRisk = risks.find(r => r.id === formData.risco_id);
      if (!selectedRisk) throw new Error('Risco não encontrado');
      
      // Gerar código automático do controle
      const controlCode = await generateControlCode(formData.nome, selectedRisk.id);

      // Get current project ID
      const { data: projects } = await supabase
        .from('project_info')
        .select('id')
        .limit(1);
      
      if (!projects || projects.length === 0) {
        throw new Error('Nenhum projeto encontrado');
      }

      const projectId = projects[0].id;

      const { error } = await supabase
        .from('kris')
        .insert({
          ...formData,
          codigo: controlCode,
          user_id: user.id,
          project_info_id: projectId
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Controle criado com sucesso!",
      });

      setFormData({
        macro_processo: "",
        processo_id: "",
        risco_id: "",
        nome: "",
        objetivo: "",
        descricao: "",
        atividade: "",
        forma_atuacao: "",
        forma_execucao: "",
        periodicidade: "",
        prioridade: "",
        categoria: "",
        tipo_medicao: "",
        frequencia_medicao: "",
        responsavel: "",
        status: "Ativo",
        validacao_etapa: 0
      });
      setFilteredProcesses([]);
      setFilteredRisks([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar controle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o controle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Novo Controle</DialogTitle>
          <DialogDescription>
            Adicione um novo controle ao framework
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Macro Processo */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="macro_processo">1. Macro Processo</Label>
            <Select value={formData.macro_processo} onValueChange={handleMacroProcessChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o macro processo" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {macroProcesses.map((macroProcess) => (
                  <SelectItem key={macroProcess} value={macroProcess}>
                    {macroProcess}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Processo */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="processo">2. Processo</Label>
            <Select 
              value={formData.processo_id} 
              onValueChange={handleProcessChange}
              disabled={!formData.macro_processo}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o processo" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {filteredProcesses.map((process) => (
                  <SelectItem key={process.id} value={process.id}>
                    {process.id} - {process.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Risco */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="risco">3. Risco</Label>
            <Select 
              value={formData.risco_id} 
              onValueChange={(value) => setFormData({...formData, risco_id: value})}
              disabled={!formData.processo_id}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o risco" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {filteredRisks.map((risk) => (
                  <SelectItem key={risk.id} value={risk.id}>
                    {risk.codigo || `RI.${risk.id.substring(0,8)}`} - {risk.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Separador */}
          <div className="col-span-2">
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-4">4. Informações do Controle</h3>
          </div>

          {/* Nome do Controle */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="nome">Nome do Controle</Label>
            <Input 
              id="nome" 
              placeholder="Ex: Aprovação de Pagamentos Acima de R$ 10.000"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          {/* Objetivo do Controle */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="objetivo">Objetivo do Controle</Label>
            <Input 
              id="objetivo" 
              placeholder="Descreva o objetivo do controle"
              value={formData.objetivo}
              onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
            />
          </div>

          {/* Descrição do Controle */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="descricao">Descrição do Controle</Label>
            <Textarea 
              id="descricao" 
              placeholder="Descreva detalhadamente o controle"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              rows={4}
            />
          </div>

          {/* Atividade */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="atividade">Atividade</Label>
            <Input 
              id="atividade" 
              placeholder="Descreva as atividades relacionadas"
              value={formData.atividade}
              onChange={(e) => setFormData({...formData, atividade: e.target.value})}
            />
          </div>

          {/* Responsável - Lista de Gerência */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="responsavel_gerencia">Responsável</Label>
            <Select value={formData.responsavel} onValueChange={(value) => setFormData({...formData, responsavel: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a gerência responsável" />
              </SelectTrigger>
              <SelectContent>
                {responsavelOptions.map((resp) => (
                  <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Separador para Classificação do Controle */}
          <div className="col-span-2 mt-6">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Classificação do Controle</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Forma de Atuação */}
                <div className="space-y-2">
                  <Label htmlFor="forma_atuacao">Forma de Atuação</Label>
                  <Select value={formData.forma_atuacao} onValueChange={(value) => setFormData({...formData, forma_atuacao: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Forma de Execução */}
                <div className="space-y-2">
                  <Label htmlFor="forma_execucao">Forma de Execução</Label>
                  <Select value={formData.forma_execucao} onValueChange={(value) => setFormData({...formData, forma_execucao: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {formaExecucaoOptions.map((exec) => (
                        <SelectItem key={exec} value={exec}>{exec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Periodicidade ou Frequência */}
                <div className="space-y-2">
                  <Label htmlFor="periodicidade">Periodicidade ou Frequência</Label>
                  <Select value={formData.periodicidade} onValueChange={(value) => setFormData({...formData, periodicidade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodicidadeOptions.map((per) => (
                        <SelectItem key={per} value={per}>{per}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridade */}
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => setFormData({...formData, prioridade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridadeOptions.map((prio) => (
                        <SelectItem key={prio} value={prio}>{prio}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Demais campos reorganizados */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_medicao">Tipo de Medição</Label>
            <Input 
              id="tipo_medicao"
              placeholder="Ex: Qualitativo, Quantitativo"
              value={formData.tipo_medicao}
              onChange={(e) => setFormData({...formData, tipo_medicao: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequencia">Frequência</Label>
            <Select value={formData.frequencia_medicao} onValueChange={(value) => setFormData({...formData, frequencia_medicao: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((freq) => (
                  <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validacao_etapa">Etapa de Validação</Label>
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
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.nome || !formData.processo_id || !formData.risco_id}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Criando..." : "Criar Controle"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ControlModal;