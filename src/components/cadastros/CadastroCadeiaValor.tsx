
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Building, GitBranch, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { generateMacroProcessCode } from "@/lib/utils";

const CadastroCadeiaValor = () => {
  const [estruturas, setEstruturas] = useState([]);
  const [macroProcessos, setMacroProcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  
  const [newEstrutura, setNewEstrutura] = useState({
    nome: "",
    descricao: "",
    cor: "blue"
  });

  const [newMacroProcesso, setNewMacroProcesso] = useState({
    nome: "",
    descricao: "",
    estrutura_id: ""
  });

  const [estruturaDialogOpen, setEstruturaDialogOpen] = useState(false);
  const [macroProcessoDialogOpen, setMacroProcessoDialogOpen] = useState(false);
  const { toast } = useToast();

  const colorOptions = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800", 
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800"
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get current project
      const { data: projects } = await supabase
        .from('project_info')
        .select('id')
        .limit(1);
      
      if (projects && projects.length > 0) {
        const projectId = projects[0].id;
        setCurrentProjectId(projectId);
        
        // Fetch structures and macro processes
        const [estruturasRes, macroProcessosRes] = await Promise.all([
          supabase
            .from('estruturas_cadeia_valor')
            .select('*')
            .eq('project_info_id', projectId)
            .order('ordem'),
          supabase
            .from('macro_processos')
            .select('*')
            .eq('project_info_id', projectId)
        ]);

        if (estruturasRes.error) throw estruturasRes.error;
        if (macroProcessosRes.error) throw macroProcessosRes.error;

        setEstruturas(estruturasRes.data || []);
        setMacroProcessos(macroProcessosRes.data || []);
      }
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
      console.log('Criando macro processo com ID:', generatedId);

      const { data, error } = await supabase
        .from('macro_processos')
        .insert([{
          id: generatedId,
          nome: newMacroProcesso.nome,
          descricao: newMacroProcesso.descricao,
          estrutura_id: newMacroProcesso.estrutura_id,
          project_info_id: currentProjectId
        }])
        .select();

      if (error) {
        console.error('Erro no banco:', error);
        throw error;
      }

      console.log('Macro processo criado:', data);

      toast({
        title: "Sucesso",
        description: `Macro Processo "${newMacroProcesso.nome}" criado com sucesso!`,
      });

      setNewMacroProcesso({ nome: "", descricao: "", estrutura_id: "" });
      setMacroProcessoDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao criar macro processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o macro processo. Verifique se todos os campos estão preenchidos.",
        variant: "destructive",
      });
    }
  };

  const removerEstrutura = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estruturas_cadeia_valor')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Estrutura removida com sucesso!",
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao remover estrutura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a estrutura",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Configuração da Cadeia de Valor</h3>
        <div className="flex gap-2">
          {/* Dialog para Nova Estrutura */}
          <Dialog open={estruturaDialogOpen} onOpenChange={setEstruturaDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Nova Estrutura
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Estrutura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEstrutura">Nome da Estrutura</Label>
                  <Input
                    id="nomeEstrutura"
                    value={newEstrutura.nome}
                    onChange={(e) => setNewEstrutura({...newEstrutura, nome: e.target.value})}
                    placeholder="Ex: Processos Primários, Processos de Apoio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corEstrutura">Cor</Label>
                  <Select value={newEstrutura.cor} onValueChange={(value) => setNewEstrutura({...newEstrutura, cor: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cor" />
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
                <div className="space-y-2">
                  <Label htmlFor="descricaoEstrutura">Descrição</Label>
                  <Textarea
                    id="descricaoEstrutura"
                    value={newEstrutura.descricao}
                    onChange={(e) => setNewEstrutura({...newEstrutura, descricao: e.target.value})}
                    placeholder="Descrição da estrutura"
                  />
                </div>
                <Button onClick={handleCreateEstrutura} className="w-full" disabled={!newEstrutura.nome}>
                  Criar Estrutura
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog para Novo Macro Processo */}
          <Dialog open={macroProcessoDialogOpen} onOpenChange={setMacroProcessoDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
                Novo Macro Processo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Macro Processo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estruturaMacro">Estrutura</Label>
                  <Select 
                    value={newMacroProcesso.estrutura_id} 
                    onValueChange={(value) => setNewMacroProcesso({...newMacroProcesso, estrutura_id: value})}
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
                  <Label htmlFor="nomeMacro">Nome do Macro Processo</Label>
                  <Input
                    id="nomeMacro"
                    value={newMacroProcesso.nome}
                    onChange={(e) => setNewMacroProcesso({...newMacroProcesso, nome: e.target.value})}
                    placeholder="Ex: Gestão Comercial, Gestão Financeira"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricaoMacro">Descrição</Label>
                  <Textarea
                    id="descricaoMacro"
                    value={newMacroProcesso.descricao}
                    onChange={(e) => setNewMacroProcesso({...newMacroProcesso, descricao: e.target.value})}
                    placeholder="Descrição do macro processo"
                  />
                </div>
                <Button 
                  onClick={handleCreateMacroProcesso} 
                  className="w-full" 
                  disabled={!newMacroProcesso.nome || !newMacroProcesso.estrutura_id}
                >
                  Criar Macro Processo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Estruturas */}
      <div className="space-y-4">
        {estruturas.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma estrutura cadastrada
              </h3>
              <p className="text-gray-500 mb-4">
                Comece criando uma estrutura da cadeia de valor para organizar seus macro processos.
              </p>
              <Button onClick={() => setEstruturaDialogOpen(true)}>
                Criar Primeira Estrutura
              </Button>
            </CardContent>
          </Card>
        ) : (
          estruturas.map((estrutura) => (
            <Card key={estrutura.id} className="border-l-4" style={{borderColor: estrutura.cor === 'blue' ? '#3b82f6' : estrutura.cor === 'green' ? '#10b981' : estrutura.cor === 'purple' ? '#8b5cf6' : estrutura.cor === 'orange' ? '#f59e0b' : '#ef4444'}}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-slate-500" />
                    <div>
                      <CardTitle className="text-lg">{estrutura.nome}</CardTitle>
                      {estrutura.descricao && (
                        <p className="text-sm text-slate-600 mt-1">{estrutura.descricao}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={colorOptions[estrutura.cor]}>
                      {estrutura.cor === 'blue' ? 'Azul' : 
                       estrutura.cor === 'green' ? 'Verde' :
                       estrutura.cor === 'purple' ? 'Roxo' :
                       estrutura.cor === 'orange' ? 'Laranja' : 'Vermelho'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removerEstrutura(estrutura.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-700">Macro Processos:</h4>
                    <Badge variant="secondary">
                      {macroProcessos.filter(mp => mp.estrutura_id === estrutura.id).length} processos
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {macroProcessos
                      .filter(mp => mp.estrutura_id === estrutura.id)
                      .map(mp => (
                        <div key={mp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-sm">{mp.id}</span>
                            <span className="ml-2 text-sm text-slate-600">{mp.nome}</span>
                            {mp.descricao && (
                              <p className="text-xs text-slate-500 mt-1">{mp.descricao}</p>
                            )}
                          </div>
                          <GitBranch className="w-4 h-4 text-slate-400" />
                        </div>
                      ))
                    }
                    {macroProcessos.filter(mp => mp.estrutura_id === estrutura.id).length === 0 && (
                      <p className="text-sm text-slate-500 italic py-2">
                        Nenhum macro processo cadastrado nesta estrutura
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CadastroCadeiaValor;
