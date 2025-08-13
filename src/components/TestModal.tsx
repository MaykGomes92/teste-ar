import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateTestCode } from "@/lib/utils";

interface TestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TestModal = ({ open, onOpenChange, onSuccess }: TestModalProps) => {
  const [macroProcesses, setMacroProcesses] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [controls, setControls] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [filteredControls, setFilteredControls] = useState([]);
  const [selectedControl, setSelectedControl] = useState(null);
  
  const [formData, setFormData] = useState({
    macro_processo: "",
    processo_id: "",
    risco_id: "",
    controle_id: "",
    nome: "",
    descricao: "",
    procedimento_realizado: "",
    data_execucao: "",
    executor: "",
    revisor: "",
    maturidade: 0,
    mitigacao: 0,
    validacao_etapa: 0,
    evidencia_files: [],
    evidencia_file_names: []
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

  const maturityOptions = [
    { value: 0, label: "Não existente" },
    { value: 1, label: "Informal" },
    { value: 2, label: "Padronizado" },
    { value: 3, label: "Monitorado" },
    { value: 4, label: "Otimizado" }
  ];

  const mitigationOptions = [
    { value: 0, label: "Não Mitiga" },
    { value: 1, label: "Insatisfatório" },
    { value: 2, label: "Satisfatório" },
    { value: 3, label: "Bom" },
    { value: 4, label: "Ótimo" }
  ];

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [processesRes, risksRes, controlsRes] = await Promise.all([
        supabase.from('processos').select('*').order('nome'),
        supabase.from('riscos').select('*').order('nome'),
        supabase.from('kris').select('*').order('nome')
      ]);

      if (processesRes.error) throw processesRes.error;
      if (risksRes.error) throw risksRes.error;
      if (controlsRes.error) throw controlsRes.error;

      setProcesses(processesRes.data || []);
      setRisks(risksRes.data || []);
      setControls(controlsRes.data || []);
      
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
    setFormData({...formData, macro_processo: macroProcess, processo_id: "", risco_id: "", controle_id: ""});
    
    // Filtrar processos pelo macro processo selecionado
    const processesFiltered = processes.filter(process => process.macro_processo === macroProcess);
    setFilteredProcesses(processesFiltered);
    setFilteredRisks([]);
    setFilteredControls([]);
    setSelectedControl(null);
  };

  const handleProcessChange = (processId: string) => {
    setFormData({...formData, processo_id: processId, risco_id: "", controle_id: ""});
    
    // Filtrar riscos pelo processo selecionado
    const processRisks = risks.filter(risk => risk.processo_id === processId);
    setFilteredRisks(processRisks);
    setFilteredControls([]);
    setSelectedControl(null);
  };

  const handleRiskChange = (riskId: string) => {
    setFormData({...formData, risco_id: riskId, controle_id: ""});
    
    // Filtrar controles pelo risco selecionado
    const riskControls = controls.filter(control => control.risco_id === riskId);
    setFilteredControls(riskControls);
    setSelectedControl(null);
  };

  const handleControlChange = (controlId: string) => {
    setFormData({...formData, controle_id: controlId});
    
    // Buscar controle selecionado para preencher objetivo
    const control = controls.find(c => c.id === controlId);
    setSelectedControl(control);
    
    if (control && control.descricao) {
      setFormData(prev => ({...prev, descricao: control.descricao}));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Iniciando criação de teste...');
      console.log('Form data:', formData);
      
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
      console.log('Project ID:', projectId);

      // Gerar código automático do teste
      const testCode = await generateTestCode(formData.nome, formData.controle_id);
      console.log('Código gerado:', testCode);

      let evidenciaPaths = [];
      let evidenciaNames = [];

      // Upload das evidências se fornecidas
      if (formData.evidencia_files.length > 0) {
        for (const file of formData.evidencia_files) {
          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('test-evidences')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('Erro no upload da evidência:', uploadError);
          } else {
            evidenciaPaths.push(fileName);
            evidenciaNames.push(file.name);
          }
        }
      }

      // Remover campos que não existem na tabela antes de inserir no banco
      const { macro_processo, evidencia_files, evidencia_file_names, ...testData } = formData;
      console.log('Dados para inserção:', testData);
      
      const { error } = await supabase
        .from('testes')
        .insert({
          ...testData,
          codigo: testCode,
          user_id: user.id,
          project_info_id: projectId,
          evidencia_paths: evidenciaPaths,
          evidencia_names: evidenciaNames
        });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Teste criado com sucesso!",
      });

      setFormData({
        macro_processo: "",
        processo_id: "",
        risco_id: "",
        controle_id: "",
        nome: "",
        descricao: "",
        procedimento_realizado: "",
        data_execucao: "",
        executor: "",
        revisor: "",
        maturidade: 0,
        mitigacao: 0,
        validacao_etapa: 0,
        evidencia_files: [],
        evidencia_file_names: []
      });
      setFilteredProcesses([]);
      setFilteredRisks([]);
      setFilteredControls([]);
      setSelectedControl(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar teste:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o teste",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Novo Teste</DialogTitle>
          <DialogDescription>
            Adicione um novo teste de controle
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
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

          {/* Risco */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="risco">3. Risco</Label>
            <Select 
              value={formData.risco_id} 
              onValueChange={handleRiskChange}
              disabled={!formData.processo_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o risco" />
              </SelectTrigger>
              <SelectContent>
                {filteredRisks.map((risk) => (
                  <SelectItem key={risk.id} value={risk.id}>
                    {risk.codigo || `RI.${risk.id.substring(0,8)}`} - {risk.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controle */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="controle">4. Controle</Label>
            <Select 
              value={formData.controle_id} 
              onValueChange={handleControlChange}
              disabled={!formData.risco_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o controle" />
              </SelectTrigger>
              <SelectContent>
                {filteredControls.map((control) => (
                  <SelectItem key={control.id} value={control.id}>
                    {control.codigo || `CT.${control.id.substring(0,8)}`} - {control.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Objetivo do Controle (preenchido automaticamente) */}
          {selectedControl && (
            <div className="col-span-2 space-y-2">
              <Label>Objetivo do Controle</Label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                {selectedControl.descricao || "Descrição não disponível"}
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="col-span-2">
            <hr className="my-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-4">5. Informações do Teste</h3>
          </div>

          {/* Nome do Teste */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="nome">Nome do Teste</Label>
            <Input 
              id="nome" 
              placeholder="Ex: Teste de Desenho - Aprovação de Pagamentos"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
            />
          </div>

          {/* Procedimento Realizado */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="procedimento">Procedimento Realizado</Label>
            <Textarea 
              id="procedimento" 
              placeholder="Descreva o procedimento realizado no teste"
              value={formData.procedimento_realizado}
              onChange={(e) => setFormData({...formData, procedimento_realizado: e.target.value})}
              rows={3}
            />
          </div>

          {/* Data de Execução */}
          <div className="space-y-2">
            <Label htmlFor="data_execucao">Data de Execução</Label>
            <Input 
              id="data_execucao" 
              type="date"
              value={formData.data_execucao}
              onChange={(e) => setFormData({...formData, data_execucao: e.target.value})}
            />
          </div>

          {/* Executor */}
          <div className="space-y-2">
            <Label htmlFor="executor">Executor</Label>
            <Input 
              id="executor"
              placeholder="Nome do executor"
              value={formData.executor}
              onChange={(e) => setFormData({...formData, executor: e.target.value})}
            />
          </div>

          {/* Revisor */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="revisor">Revisor</Label>
            <Input 
              id="revisor"
              placeholder="Nome do revisor"
              value={formData.revisor}
              onChange={(e) => setFormData({...formData, revisor: e.target.value})}
            />
          </div>

          {/* Teste de Desenho */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teste de Desenho</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maturidade">Maturidade</Label>
                  <Select 
                    value={formData.maturidade.toString()} 
                    onValueChange={(value) => setFormData({...formData, maturidade: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {maturityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.value} - {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mitigacao">Mitigação</Label>
                  <Select 
                    value={formData.mitigacao.toString()} 
                    onValueChange={(value) => setFormData({...formData, mitigacao: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mitigationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.value} - {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resultado */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="resultado">Resultado</Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <div className="text-center">
                      <span className="text-lg font-semibold">
                        Soma: {formData.maturidade + formData.mitigacao}
                      </span>
                      <div className="mt-2">
                        <span className={`px-3 py-1 rounded-full font-bold ${
                          (formData.maturidade + formData.mitigacao) < 4 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {(formData.maturidade + formData.mitigacao) < 4 ? 'NÃO ATENDE' : 'ATENDE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Etapa de Validação */}
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

          {/* Conclusão */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="descricao">Conclusão</Label>
            <Textarea 
              id="descricao" 
              placeholder="Descrição da conclusão dos testes realizados"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              rows={3}
            />
          </div>
          {/* Evidências */}
          <div className="col-span-2 space-y-2">
            <Label htmlFor="evidencias">Evidências (Opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="evidencias"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    setFormData({
                      ...formData, 
                      evidencia_files: files,
                      evidencia_file_names: files.map(f => f.name)
                    });
                  }
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('evidencias')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Selecionar Evidências
              </Button>
              {formData.evidencia_file_names.length > 0 && (
                <div className="text-sm text-gray-600">
                  {formData.evidencia_file_names.length} arquivo(s) selecionado(s)
                </div>
              )}
            </div>
            {formData.evidencia_file_names.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.evidencia_file_names.map((name, index) => (
                  <div key={index} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {name}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">Formatos aceitos: PDF, DOC, DOCX, PNG, JPG, JPEG, XLSX, XLS</p>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !formData.nome || !formData.processo_id || !formData.controle_id}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? "Criando..." : "Criar Teste"}
        </Button>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-2">
          Debug: nome={formData.nome ? '✓' : '✗'} | processo_id={formData.processo_id ? '✓' : '✗'} | controle_id={formData.controle_id ? '✓' : '✗'}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestModal;