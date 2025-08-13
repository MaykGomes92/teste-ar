
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Package, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const CadastroEntregaveis = () => {
  const [entregaveis, setEntregaveis] = useState([
    { 
      id: 1, 
      nome: "Mapeamento de Processos", 
      descricao: "Documentação completa dos processos organizacionais",
      status: "Em Andamento",
      obrigatorio: true
    },
    { 
      id: 2, 
      nome: "Identificação de Riscos e Controles", 
      descricao: "Levantamento e análise dos riscos operacionais",
      status: "Planejado",
      obrigatorio: true
    },
    { 
      id: 3, 
      nome: "Mapeamento de Oportunidades de Melhorias", 
      descricao: "Identificação de pontos de melhoria nos processos",
      status: "Planejado",
      obrigatorio: true
    },
    { 
      id: 4, 
      nome: "Testes de Desenho", 
      descricao: "Validação do design dos controles internos",
      status: "Planejado",
      obrigatorio: true
    },
    { 
      id: 5, 
      nome: "Testes de Efetividade", 
      descricao: "Verificação da efetividade operacional dos controles",
      status: "Planejado",
      obrigatorio: true
    },
    { 
      id: 6, 
      nome: "Planilhas e Dados", 
      descricao: "Mapeamento e identificação das planilhas utilizadas nos processos, incluindo quantidade e status de mapeamento para entrega por processo",
      status: "Planejado",
      obrigatorio: true
    }
  ]);

  const [novoEntregavel, setNovoEntregavel] = useState({
    nome: "",
    descricao: "",
    obrigatorio: false
  });

  const [editandoEntregavel, setEditandoEntregavel] = useState(null);
  const [entregavelEditando, setEntregavelEditando] = useState({
    nome: "",
    descricao: "",
    obrigatorio: false
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const adicionarEntregavel = () => {
    if (novoEntregavel.nome && novoEntregavel.descricao) {
      const novoId = Math.max(...entregaveis.map(e => e.id)) + 1;
      setEntregaveis([...entregaveis, { 
        id: novoId, 
        ...novoEntregavel,
        status: "Planejado"
      }]);
      setNovoEntregavel({ nome: "", descricao: "", obrigatorio: false });
      setDialogOpen(false);
    }
  };

  const removerEntregavel = (id: number) => {
    setEntregaveis(entregaveis.filter(e => e.id !== id));
  };

  const iniciarEdicao = (entregavel) => {
    setEditandoEntregavel(entregavel.id);
    setEntregavelEditando({
      nome: entregavel.nome,
      descricao: entregavel.descricao,
      obrigatorio: entregavel.obrigatorio
    });
  };

  const salvarEdicao = () => {
    setEntregaveis(entregaveis.map(e => 
      e.id === editandoEntregavel 
        ? { ...e, ...entregavelEditando }
        : e
    ));
    setEditandoEntregavel(null);
    setEntregavelEditando({ nome: "", descricao: "", obrigatorio: false });
  };

  const cancelarEdicao = () => {
    setEditandoEntregavel(null);
    setEntregavelEditando({ nome: "", descricao: "", obrigatorio: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800";
      case "Em Andamento": return "bg-blue-100 text-blue-800";
      case "Planejado": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Entregáveis do Projeto</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Entregável
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Entregável</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEntregavel">Nome do Entregável</Label>
                <Input
                  id="nomeEntregavel"
                  value={novoEntregavel.nome}
                  onChange={(e) => setNovoEntregavel({...novoEntregavel, nome: e.target.value})}
                  placeholder="Ex: Relatório Executivo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricaoEntregavel">Descrição</Label>
                <Textarea
                  id="descricaoEntregavel"
                  value={novoEntregavel.descricao}
                  onChange={(e) => setNovoEntregavel({...novoEntregavel, descricao: e.target.value})}
                  placeholder="Descreva o entregável e seus objetivos"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="obrigatorio"
                  checked={novoEntregavel.obrigatorio}
                  onCheckedChange={(checked) => setNovoEntregavel({...novoEntregavel, obrigatorio: !!checked})}
                />
                <Label htmlFor="obrigatorio">Entregável obrigatório</Label>
              </div>
              <Button onClick={adicionarEntregavel} className="w-full">
                Adicionar Entregável
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {entregaveis.map((entregavel) => (
          <Card key={entregavel.id}>
            <CardContent className="p-4">
              {editandoEntregavel === entregavel.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Entregável</Label>
                    <Input
                      value={entregavelEditando.nome}
                      onChange={(e) => setEntregavelEditando({...entregavelEditando, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={entregavelEditando.descricao}
                      onChange={(e) => setEntregavelEditando({...entregavelEditando, descricao: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={entregavelEditando.obrigatorio}
                      onCheckedChange={(checked) => setEntregavelEditando({...entregavelEditando, obrigatorio: !!checked})}
                    />
                    <Label>Entregável obrigatório</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={salvarEdicao} size="sm" className="bg-green-600 hover:bg-green-700">
                      Salvar
                    </Button>
                    <Button onClick={cancelarEdicao} variant="outline" size="sm">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="w-5 h-5 text-slate-500" />
                      <h4 className="font-semibold text-slate-800">{entregavel.nome}</h4>
                      <Badge className={getStatusColor(entregavel.status)}>
                        {entregavel.status}
                      </Badge>
                      {entregavel.obrigatorio && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Obrigatório
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <p>{entregavel.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => iniciarEdicao(entregavel)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removerEntregavel(entregavel.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CadastroEntregaveis;
