import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Plus, Building, Layers, GitBranch, Settings, Edit, Info, Upload, Paperclip, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { generateMacroProcessCode, generateProcessCode } from "@/lib/utils";

interface ValueChainProps {
  onProcessClick?: (processId: string) => void;
  selectedProjectId?: string;
}

const ValueChain = ({ onProcessClick, selectedProjectId }: ValueChainProps) => {
  const [processes, setProcesses] = useState([]);
  const [estruturas, setEstruturas] = useState([]);
  const [macroProcessos, setMacroProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  const [newProcess, setNewProcess] = useState({
    id: "",
    nome: "",
    descricao: "",
    macro_processo_id: "",
    responsavel: ""
  });
  
  const [newMacroProcesso, setNewMacroProcesso] = useState({
    id: "",
    nome: "",
    descricao: "",
    estrutura_id: ""
  });
  
  const [newEstrutura, setNewEstrutura] = useState({
    nome: "",
    descricao: "",
    cor: "blue"
  });
  
  const [estruturaDialogOpen, setEstruturaDialogOpen] = useState(false);
  const [macroProcessoDialogOpen, setMacroProcessoDialogOpen] = useState(false);
  const [editingEstrutura, setEditingEstrutura] = useState(null);
  const [editingMacroProcesso, setEditingMacroProcesso] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const { toast } = useToast();

  const colorOptions = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    red: "bg-red-500"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use selectedProjectId or default to IRB template
      const projectId = selectedProjectId || 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01';
      setCurrentProjectId(projectId);
        
      // Fetch all data in parallel
      const [estruturasRes, macroProcessosRes, processesRes] = await Promise.all([
        supabase
          .from('estruturas_cadeia_valor')
          .select('*')
          .eq('project_info_id', projectId)
          .order('ordem'),
        supabase
          .from('macro_processos')
          .select('*')
          .eq('project_info_id', projectId),
        supabase
          .from('processos')
          .select('*')
          .eq('project_info_id', projectId)
          .order('nome')
      ]);

      if (estruturasRes.error) throw estruturasRes.error;
      if (macroProcessosRes.error) throw macroProcessosRes.error;
      if (processesRes.error) throw processesRes.error;

      setEstruturas(estruturasRes.data || []);
      setMacroProcessos(macroProcessosRes.data || []);
      setProcesses(processesRes.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateEstrutura = async () => {
    try {
      if (!currentProjectId) {
        toast({
          title: "Erro",
          description: "Projeto não identificado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('estruturas_cadeia_valor')
        .insert([{
          nome: newEstrutura.nome,
          descricao: newEstrutura.descricao,
          cor: newEstrutura.cor,
          project_info_id: currentProjectId,
          ordem: estruturas.length + 1
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estrutura criada com sucesso!",
      });

      setNewEstrutura({ nome: "", descricao: "", cor: "blue" });
      setEstruturaDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao criar estrutura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a estrutura",
        variant: "destructive",
      });
    }
  };

  const handleCreateMacroProcesso = async () => {
    try {
      if (!currentProjectId) {
        toast({
          title: "Erro",
          description: "Projeto não identificado",
          variant: "destructive",
        });
        return;
      }

      const generatedId = await generateMacroProcessCode(newMacroProcesso.nome);

      const { error } = await supabase
        .from('macro_processos')
        .insert([{
          id: generatedId,
          nome: newMacroProcesso.nome,
          descricao: newMacroProcesso.descricao,
          estrutura_id: newMacroProcesso.estrutura_id,
          project_info_id: currentProjectId
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Macro Processo criado com sucesso!",
      });

      setNewMacroProcesso({ id: "", nome: "", descricao: "", estrutura_id: "" });
      setMacroProcessoDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao criar macro processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o macro processo",
        variant: "destructive",
      });
    }
  };

  const handleCreateProcess = async () => {
    try {
      if (!currentProjectId) {
        toast({
          title: "Erro",
          description: "Projeto não identificado",
          variant: "destructive",
        });
        return;
      }

      const generatedId = await generateProcessCode(newProcess.nome);

      const { error } = await supabase
        .from('processos')
        .insert([{
          id: generatedId,
          nome: newProcess.nome,
          descricao: newProcess.descricao,
          macro_processo_id: newProcess.macro_processo_id,
          responsavel: newProcess.responsavel,
          status: 'Ativo',
          project_info_id: currentProjectId,
          macro_processo: macroProcessos.find(mp => mp.id === newProcess.macro_processo_id)?.nome || ""
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Processo criado com sucesso!",
      });

      setNewProcess({
        id: "",
        nome: "",
        descricao: "",
        macro_processo_id: "",
        responsavel: ""
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o processo",
        variant: "destructive",
      });
    }
  };

  const handleEditEstrutura = async (estruturaId: string, novoNome: string) => {
    try {
      const { error } = await supabase
        .from('estruturas_cadeia_valor')
        .update({ nome: novoNome, updated_at: new Date().toISOString() })
        .eq('id', estruturaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nome da estrutura atualizado com sucesso!",
      });

      setEditingEstrutura(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar estrutura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a estrutura",
        variant: "destructive",
      });
    }
  };

  const handleEditMacroProcesso = async (macroProcessoId: string, novoNome: string) => {
    try {
      const { error } = await supabase
        .from('macro_processos')
        .update({ nome: novoNome, updated_at: new Date().toISOString() })
        .eq('id', macroProcessoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nome do macro processo atualizado com sucesso!",
      });

      setEditingMacroProcesso(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar macro processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o macro processo",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (processId: string, files: FileList) => {
    try {
      setUploadingFiles(prev => new Set(prev).add(processId));
      
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${processId}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('bpmn-diagrams')
          .upload(`process-attachments/${fileName}`, file);

        if (error) throw error;
        return { fileName: file.name, path: data.path };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Get current process data
      const { data: currentProcess, error: fetchError } = await supabase
        .from('processos')
        .select('attachment_names, attachment_paths, attachment_dates')
        .eq('id', processId)
        .single();

      if (fetchError) throw fetchError;

      // Update process with new attachments
      const newNames = [...(currentProcess.attachment_names || []), ...uploadedFiles.map(f => f.fileName)];
      const newPaths = [...(currentProcess.attachment_paths || []), ...uploadedFiles.map(f => f.path)];
      const newDates = [...(currentProcess.attachment_dates || []), ...Array(uploadedFiles.length).fill(new Date().toISOString())];

      const { error: updateError } = await supabase
        .from('processos')
        .update({
          attachment_names: newNames,
          attachment_paths: newPaths,
          attachment_dates: newDates,
          updated_at: new Date().toISOString()
        })
        .eq('id', processId);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: `${uploadedFiles.length} arquivo(s) anexado(s) com sucesso!`,
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload dos arquivos",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(processId);
        return newSet;
      });
    }
  };

  const downloadFile = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('bpmn-diagrams')
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Inativo": return "bg-red-100 text-red-800 border-red-200";
      case "Em Desenvolvimento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProcessesByEstrutura = (estruturaId: string) => {
    const macroProcessosByEstrutura = macroProcessos.filter(mp => mp.estrutura_id === estruturaId);
    return processes.filter(p => 
      macroProcessosByEstrutura.some(mp => mp.id === p.macro_processo_id)
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cadeia de Valor</h2>
          <p className="text-slate-600">Estrutura organizacional dos processos empresariais</p>
        </div>
        <div className="flex gap-2">
          {/* Estrutura da Cadeia de Valor Dialog */}
          <Dialog open={estruturaDialogOpen} onOpenChange={setEstruturaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Estrutura da Cadeia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Estrutura da Cadeia de Valor</DialogTitle>
                <DialogDescription>
                  Configure as estruturas e macro processos da cadeia de valor
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Create New Structure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Nova Estrutura</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estruturaNome">Nome da Estrutura</Label>
                        <Input
                          id="estruturaNome"
                          value={newEstrutura.nome}
                          onChange={(e) => setNewEstrutura({...newEstrutura, nome: e.target.value})}
                          placeholder="Ex: Processos Primários"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estruturaCor">Cor</Label>
                        <Select
                          value={newEstrutura.cor}
                          onValueChange={(value) => setNewEstrutura({...newEstrutura, cor: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Azul</SelectItem>
                            <SelectItem value="green">Verde</SelectItem>
                            <SelectItem value="purple">Roxo</SelectItem>
                            <SelectItem value="orange">Laranja</SelectItem>
                            <SelectItem value="red">Vermelho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estruturaDescricao">Descrição</Label>
                      <Textarea
                        id="estruturaDescricao"
                        value={newEstrutura.descricao}
                        onChange={(e) => setNewEstrutura({...newEstrutura, descricao: e.target.value})}
                        placeholder="Descrição da estrutura"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateEstrutura}
                      disabled={!newEstrutura.nome}
                      className="w-full"
                    >
                      Criar Estrutura
                    </Button>
                  </CardContent>
                </Card>

                {/* Create New Macro Processo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Novo Macro Processo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="macroProcessoEstrutura">Estrutura</Label>
                        <Select
                          value={newMacroProcesso.estrutura_id}
                          onValueChange={(value) => setNewMacroProcesso({
                            ...newMacroProcesso, 
                            estrutura_id: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a estrutura" />
                          </SelectTrigger>
                          <SelectContent>
                            {estruturas.map((estrutura) => (
                              <SelectItem key={estrutura.id} value={estrutura.id}>
                                {estrutura.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="macroProcessoId">ID (Gerado Automaticamente)</Label>
                        <Input
                          id="macroProcessoId"
                          value={newMacroProcesso.id}
                          disabled
                          placeholder="Ex: MP-PRO-001"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="macroProcessoNome">Nome do Macro Processo</Label>
                      <Input
                        id="macroProcessoNome"
                        value={newMacroProcesso.nome}
                        onChange={(e) => setNewMacroProcesso({...newMacroProcesso, nome: e.target.value})}
                        placeholder="Ex: Gestão Comercial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="macroProcessoDescricao">Descrição</Label>
                      <Textarea
                        id="macroProcessoDescricao"
                        value={newMacroProcesso.descricao}
                        onChange={(e) => setNewMacroProcesso({...newMacroProcesso, descricao: e.target.value})}
                        placeholder="Descrição do macro processo"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateMacroProcesso}
                      disabled={!newMacroProcesso.nome || !newMacroProcesso.estrutura_id}
                      className="w-full"
                    >
                      Criar Macro Processo
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Structures and Macro Processes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Estruturas Existentes</h3>
                  {estruturas.map((estrutura) => (
                    <Card key={estrutura.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${colorOptions[estrutura.cor] || 'bg-gray-500'}`}></div>
                            {editingEstrutura === estrutura.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={estrutura.nome}
                                  onChange={(e) => {
                                    const updatedEstruturas = estruturas.map(est => 
                                      est.id === estrutura.id 
                                        ? { ...est, nome: e.target.value }
                                        : est
                                    );
                                    setEstruturas(updatedEstruturas);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditEstrutura(estrutura.id, estrutura.nome);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingEstrutura(null);
                                      fetchData(); // Reset to original value
                                    }
                                  }}
                                  className="h-8 text-base font-semibold"
                                  autoFocus
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleEditEstrutura(estrutura.id, estrutura.nome)}
                                  className="h-8 px-2"
                                >
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingEstrutura(null);
                                    fetchData(); // Reset to original value
                                  }}
                                  className="h-8 px-2"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-semibold">{estrutura.nome}</h4>
                                <Edit 
                                  className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-600" 
                                  onClick={() => setEditingEstrutura(estrutura.id)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                        {estrutura.descricao && (
                          <p className="text-sm text-gray-600 mb-3">{estrutura.descricao}</p>
                        )}
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Macro Processos:</h5>
                          {macroProcessos
                            .filter(mp => mp.estrutura_id === estrutura.id)
                            .map(mp => (
                              <div key={mp.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                {editingMacroProcesso === mp.id ? (
                                  <div className="flex items-center gap-2 w-full">
                                    <Input
                                      value={mp.nome}
                                      onChange={(e) => {
                                        const updatedMacroProcessos = macroProcessos.map(macro => 
                                          macro.id === mp.id 
                                            ? { ...macro, nome: e.target.value }
                                            : macro
                                        );
                                        setMacroProcessos(updatedMacroProcessos);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleEditMacroProcesso(mp.id, mp.nome);
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingMacroProcesso(null);
                                          fetchData(); // Reset to original value
                                        }
                                      }}
                                      className="h-7 text-sm flex-1"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleEditMacroProcesso(mp.id, mp.nome)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      Salvar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingMacroProcesso(null);
                                        fetchData(); // Reset to original value
                                      }}
                                      className="h-7 px-2 text-xs"
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-sm">{mp.id} - {mp.nome}</span>
                                    <Edit 
                                      className="w-3 h-3 text-gray-500 cursor-pointer hover:text-blue-600" 
                                      onClick={() => setEditingMacroProcesso(mp.id)}
                                    />
                                  </>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Value Chain Visualization */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            Estrutura da Cadeia de Valor
          </CardTitle>
          <CardDescription>
            Visualização hierárquica dos processos organizacionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {estruturas.map((estrutura, index) => {
            const processesInEstrutura = getProcessesByEstrutura(estrutura.id);
            const estruturaColor = colorOptions[estrutura.cor] || "bg-gray-500";
            
            return (
              <div key={estrutura.id} className="relative">
                {/* Structure Header */}
                <div className={`${estruturaColor} text-white rounded-lg p-4 mb-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{estrutura.nome}</h3>
                      <Edit 
                        className="w-4 h-4 cursor-pointer hover:bg-white/20 rounded p-0.5 transition-colors" 
                        onClick={() => setEditingEstrutura(estrutura.id)}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{processesInEstrutura.length}</div>
                      <div className="text-white/80 text-sm">Processos</div>
                    </div>
                  </div>
                  {estrutura.descricao && (
                    <p className="text-white/80 text-sm mt-2">{estrutura.descricao}</p>
                  )}
                </div>

                {/* Macro Processes */}
                <div className="space-y-4 ml-4">
                  {macroProcessos
                    .filter(mp => mp.estrutura_id === estrutura.id)
                    .map((macroProcesso) => {
                      const processesInMacro = processes.filter(p => p.macro_processo_id === macroProcesso.id);
                      
                      return (
                        <div key={macroProcesso.id} className="border-l-2 border-gray-300 pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-4 h-4 text-gray-600" />
                            <h4 className="font-semibold text-gray-800">{macroProcesso.id} - {macroProcesso.nome}</h4>
                            <Edit 
                              className="w-3 h-3 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" 
                              onClick={() => setEditingMacroProcesso(macroProcesso.id)}
                            />
                          </div>
                          
                          {/* Processes Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {processesInMacro.map((process) => (
                              <Card key={process.id} className="border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h5 className="font-semibold text-slate-800">{process.nome}</h5>
                                        <Info 
                                          className="w-4 h-4 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" 
                                          onClick={() => onProcessClick?.(process.id)}
                                        />
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className="mt-1 text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                                        onClick={() => onProcessClick?.(process.id)}
                                      >
                                        {process.id}
                                      </Badge>
                                    </div>
                                    <Badge className={getStatusColor(process.status)}>
                                      {process.status}
                                    </Badge>
                                  </div>
                                  {process.responsavel && (
                                    <p className="text-sm text-slate-600 mb-2">
                                      Responsável: {process.responsavel}
                                    </p>
                                  )}
                                   {process.descricao && (
                                     <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                                       {process.descricao}
                                     </p>
                                   )}
                                   
                                   {/* Anexos Section */}
                                   <div className="border-t pt-3 mt-3">
                                     <div className="flex items-center justify-between mb-2">
                                       <div className="flex items-center gap-1">
                                         <Paperclip className="w-3 h-3 text-slate-600" />
                                         <span className="text-xs font-medium text-slate-600">Anexos</span>
                                       </div>
                                       <label className="cursor-pointer">
                                         <input
                                           type="file"
                                           multiple
                                           className="hidden"
                                           onChange={(e) => {
                                             if (e.target.files?.length) {
                                               handleFileUpload(process.id, e.target.files);
                                             }
                                           }}
                                         />
                                         <Upload 
                                           className={`w-3 h-3 transition-colors ${
                                             uploadingFiles.has(process.id) 
                                               ? 'text-blue-500 animate-pulse' 
                                               : 'text-slate-400 hover:text-blue-600'
                                           }`}
                                         />
                                       </label>
                                     </div>
                                     
                                     {/* Lista de anexos */}
                                     <div className="space-y-1">
                                       {process.attachment_names && process.attachment_names.length > 0 ? (
                                         process.attachment_names.map((fileName, index) => (
                                           <div key={index} className="flex items-center gap-2 p-1 rounded hover:bg-slate-50">
                                             <FileText className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                             <span 
                                               className="text-xs text-slate-700 truncate flex-1 cursor-pointer hover:text-blue-600"
                                               title={fileName}
                                               onClick={() => downloadFile(process.attachment_paths[index], fileName)}
                                             >
                                               {fileName}
                                             </span>
                                           </div>
                                         ))
                                       ) : (
                                         <p className="text-xs text-slate-400 italic">Nenhum anexo</p>
                                       )}
                                     </div>
                                   </div>
                                   
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className="w-full mt-3"
                                     onClick={() => onProcessClick?.(process.id)}
                                   >
                                     Ver Detalhes
                                   </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  }
                </div>

                {/* Arrow to next structure */}
                {index < estruturas.length - 1 && (
                  <div className="flex justify-center my-6">
                    <ArrowRight className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Processos</CardTitle>
              <Building className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{processes.length}</div>
            <p className="text-sm text-slate-500">Processos mapeados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Estruturas</CardTitle>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{estruturas.length}</div>
            <p className="text-sm text-slate-500">Estruturas definidas</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Macro Processos</CardTitle>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{macroProcessos.length}</div>
            <p className="text-sm text-slate-500">Macro processos</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Processos Ativos</CardTitle>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {processes.filter(p => p.status === 'Ativo').length}
            </div>
            <p className="text-sm text-slate-500">Em operação</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValueChain;
