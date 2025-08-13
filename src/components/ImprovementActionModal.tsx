import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateImprovementCode } from "@/lib/utils";

interface ImprovementActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ImprovementActionModal = ({ open, onOpenChange, onSuccess }: ImprovementActionModalProps) => {
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [formData, setFormData] = useState({
    macro_processo: "",
    processo_id: "",
    nome: "",
    detalhamento_solucao: "",
    breve_descricao_problema: "",
    descricao_problema: "",
    tipo_oportunidade: "",
    ponto_risco_controle: false,
    esforco: "",
    beneficio: "",
    financeiro: false,
    reducao_da: false,
    produtividade: false,
    legal_regulatorio: false,
    priorizacao: "",
    tratativa: "",
    sistema_envolvido: false,
    modulo_sistema: "",
    ifrs4: false,
    ifrs17: false,
    potencial_implementacao_imediata: false,
    sistema_sera_substituido: false,
    novo_sistema: "",
    previsao_implementacao_novo_sistema: "",
    diferenca_sap_s4hanna: "",
    problema_sanado_novo_sistema: false,
    necessidade_integracao: false,
    status: "Planejado",
    responsavel: "",
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

  const statusOptions = ["Planejado", "Em Andamento", "Concluído", "Cancelado"];
  const esforcoOptions = ["Baixo", "Médio", "Alto"];
  const beneficioOptions = ["Baixo", "Médio", "Alto"];

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const { data: processesRes, error: processesError } = await supabase
        .from('processos')
        .select('*')
        .order('nome');

      if (processesError) throw processesError;

      setProcesses(processesRes || []);
      
      // Extrair macro processos únicos
      const uniqueMacroProcesses = [...new Set(processesRes?.map(p => p.macro_processo) || [])];
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
    setFormData({...formData, macro_processo: macroProcess, processo_id: ""});
    
    // Filtrar processos pelo macro processo selecionado
    const processesFiltered = processes.filter(process => process.macro_processo === macroProcess);
    setFilteredProcesses(processesFiltered);
  };

  const handleProcessChange = (processId: string) => {
    setFormData({...formData, processo_id: processId});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Get current project ID
      const { data: projects } = await supabase
        .from('project_info')
        .select('id')
        .limit(1);
      
      if (!projects || projects.length === 0) {
        throw new Error('Nenhum projeto encontrado');
      }

      const projectId = projects[0].id;

      // Gerar código automático da melhoria
      const improvementCode = await generateImprovementCode(formData.nome);

      // Remover macro_processo antes de inserir no banco (não existe na tabela)
      const { macro_processo, ...improvementData } = formData;
      
      const { error } = await supabase
        .from('melhorias')
        .insert({
          ...improvementData,
          codigo: improvementCode,
          user_id: user.id,
          project_info_id: projectId
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ação de melhoria criada com sucesso!",
      });

      // Reset form
      setFormData({
        macro_processo: "",
        processo_id: "",
        nome: "",
        detalhamento_solucao: "",
        breve_descricao_problema: "",
        descricao_problema: "",
        tipo_oportunidade: "",
        ponto_risco_controle: false,
        esforco: "",
        beneficio: "",
        financeiro: false,
        reducao_da: false,
        produtividade: false,
        legal_regulatorio: false,
        priorizacao: "",
        tratativa: "",
        sistema_envolvido: false,
        modulo_sistema: "",
        ifrs4: false,
        ifrs17: false,
        potencial_implementacao_imediata: false,
        sistema_sera_substituido: false,
        novo_sistema: "",
        previsao_implementacao_novo_sistema: "",
        diferenca_sap_s4hanna: "",
        problema_sanado_novo_sistema: false,
        necessidade_integracao: false,
        status: "Planejado",
        responsavel: "",
        validacao_etapa: 0
      });
      setFilteredProcesses([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar melhoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a ação de melhoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Registrar Nova Ação de Melhoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova iniciativa de melhoria ao portfólio
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4 overflow-y-auto max-h-[70vh]">
          {/* Macro Processo */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="macro_processo">1. Macro Processo</Label>
            <Select value={formData.macro_processo} onValueChange={handleMacroProcessChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o macro processo" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger>
                <SelectValue placeholder="Selecione o processo" />
              </SelectTrigger>
              <SelectContent>
                {filteredProcesses.map((process) => (
                  <SelectItem key={process.id} value={process.id}>
                    {process.id} - {process.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Separador */}
          <div className="col-span-2">
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-4">3. Informações da Melhoria</h3>
          </div>

          {/* Nome da melhoria */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="nome">Nome da melhoria</Label>
            <Input 
              id="nome" 
              placeholder="Ex: Digitalização de Documentos"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          {/* Detalhamento da Solução/Melhoria */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="detalhamento_solucao">Detalhamento da Solução/Melhoria</Label>
            <Textarea 
              id="detalhamento_solucao" 
              placeholder="Descreva detalhadamente a solução proposta"
              value={formData.detalhamento_solucao}
              onChange={(e) => setFormData({...formData, detalhamento_solucao: e.target.value})}
            />
          </div>

          {/* Breve Descrição do Problema */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="breve_descricao_problema">Breve Descrição do Problema</Label>
            <Textarea 
              id="breve_descricao_problema" 
              placeholder="Descreva brevemente o problema identificado"
              value={formData.breve_descricao_problema}
              onChange={(e) => setFormData({...formData, breve_descricao_problema: e.target.value})}
            />
          </div>

          {/* Atividade */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="descricao_problema">Atividade</Label>
            <Textarea 
              id="descricao_problema" 
              placeholder="Descreva a atividade"
              value={formData.descricao_problema}
              onChange={(e) => setFormData({...formData, descricao_problema: e.target.value})}
            />
          </div>

          {/* Tipo da oportunidade */}
          <div className="space-y-2">
            <Label htmlFor="tipo_oportunidade">Tipo da oportunidade</Label>
            <Input 
              id="tipo_oportunidade"
              placeholder="Ex: Automação, Processo, Tecnologia"
              value={formData.tipo_oportunidade}
              onChange={(e) => setFormData({...formData, tipo_oportunidade: e.target.value})}
            />
          </div>

          {/* Ponto de risco ou controle */}
          <div className="space-y-2">
            <Label>Ponto de risco ou controle?</Label>
            <Select 
              value={formData.ponto_risco_controle ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, ponto_risco_controle: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Esforço */}
          <div className="space-y-2">
            <Label>Esforço</Label>
            <Select value={formData.esforco} onValueChange={(value) => setFormData({...formData, esforco: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o esforço" />
              </SelectTrigger>
              <SelectContent>
                {esforcoOptions.map((esforco) => (
                  <SelectItem key={esforco} value={esforco}>{esforco}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Benefício */}
          <div className="space-y-2">
            <Label>Benefício</Label>
            <Select value={formData.beneficio} onValueChange={(value) => setFormData({...formData, beneficio: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o benefício" />
              </SelectTrigger>
              <SelectContent>
                {beneficioOptions.map((beneficio) => (
                  <SelectItem key={beneficio} value={beneficio}>{beneficio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes para diferentes categorias */}
          <div className="space-y-2">
            <Label>Financeiro</Label>
            <Select 
              value={formData.financeiro ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, financeiro: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Redução DA</Label>
            <Select 
              value={formData.reducao_da ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, reducao_da: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Produtividade</Label>
            <Select 
              value={formData.produtividade ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, produtividade: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Legal / Regulatório</Label>
            <Select 
              value={formData.legal_regulatorio ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, legal_regulatorio: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priorização */}
          <div className="space-y-2">
            <Label htmlFor="priorizacao">Priorização</Label>
            <Input 
              id="priorizacao"
              placeholder="Definir priorização"
              value={formData.priorizacao}
              onChange={(e) => setFormData({...formData, priorizacao: e.target.value})}
            />
          </div>

          {/* Tratativa */}
          <div className="space-y-2">
            <Label htmlFor="tratativa">Tratativa</Label>
            <Input 
              id="tratativa"
              placeholder="Definir tratativa"
              value={formData.tratativa}
              onChange={(e) => setFormData({...formData, tratativa: e.target.value})}
            />
          </div>

          {/* Sistema envolvido */}
          <div className="space-y-2">
            <Label>Sistema envolvido?</Label>
            <Select 
              value={formData.sistema_envolvido ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, sistema_envolvido: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Módulo do sistema */}
          <div className="space-y-2">
            <Label htmlFor="modulo_sistema">Módulo do sistema</Label>
            <Input 
              id="modulo_sistema"
              placeholder="Se não houver sistema, informar recurso utilizado"
              value={formData.modulo_sistema}
              onChange={(e) => setFormData({...formData, modulo_sistema: e.target.value})}
            />
          </div>

          {/* IFRS4 */}
          <div className="space-y-2">
            <Label>IFRS4</Label>
            <Select 
              value={formData.ifrs4 ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, ifrs4: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IFRS17 */}
          <div className="space-y-2">
            <Label>IFRS17</Label>
            <Select 
              value={formData.ifrs17 ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, ifrs17: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Potencial Implementação imediata */}
          <div className="space-y-2">
            <Label>Potencial Implementação imediata?</Label>
            <Select 
              value={formData.potencial_implementacao_imediata ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, potencial_implementacao_imediata: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Caixa de Sistema */}
          <div className="col-span-2">
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações do Sistema</h3>
          </div>

          {/* Sistema será substituído */}
          <div className="space-y-2">
            <Label>Sistema será substituído?</Label>
            <Select 
              value={formData.sistema_sera_substituido ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, sistema_sera_substituido: value === "true"})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Novo sistema */}
          <div className="space-y-2">
            <Label htmlFor="novo_sistema">Se sim, qual novo sistema?</Label>
            <Input 
              id="novo_sistema"
              placeholder="Nome do novo sistema"
              value={formData.novo_sistema}
              onChange={(e) => setFormData({...formData, novo_sistema: e.target.value})}
              disabled={!formData.sistema_sera_substituido}
            />
          </div>

          {/* Previsão de implementação */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="previsao_implementacao_novo_sistema">Qual previsão de implementação do novo sistema?</Label>
            <Input 
              id="previsao_implementacao_novo_sistema"
              placeholder="Ex: Q1 2025"
              value={formData.previsao_implementacao_novo_sistema}
              onChange={(e) => setFormData({...formData, previsao_implementacao_novo_sistema: e.target.value})}
              disabled={!formData.sistema_sera_substituido}
            />
          </div>

          {/* Diferença SAP */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="diferenca_sap_s4hanna">Se o sistema for SAP, aponte a diferença para o SAP S/4HANNA</Label>
            <Textarea 
              id="diferenca_sap_s4hanna"
              placeholder="Descreva as diferenças"
              value={formData.diferenca_sap_s4hanna}
              onChange={(e) => setFormData({...formData, diferenca_sap_s4hanna: e.target.value})}
              disabled={!formData.sistema_sera_substituido}
            />
          </div>

          {/* Problema sanado */}
          <div className="space-y-2">
            <Label>O problema relatado será sanado no novo sistema?</Label>
            <Select 
              value={formData.problema_sanado_novo_sistema ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, problema_sanado_novo_sistema: value === "true"})}
              disabled={!formData.sistema_sera_substituido}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Necessidade de integração */}
          <div className="space-y-2">
            <Label>Necessidade de integração?</Label>
            <Select 
              value={formData.necessidade_integracao ? "true" : "false"} 
              onValueChange={(value) => setFormData({...formData, necessidade_integracao: value === "true"})}
              disabled={!formData.sistema_sera_substituido}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos existentes */}
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input 
              id="responsavel"
              placeholder="Nome do responsável"
              value={formData.responsavel}
              onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 space-y-2">
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
          disabled={loading || !formData.nome || !formData.processo_id}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {loading ? "Registrando..." : "Registrar Ação"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovementActionModal;