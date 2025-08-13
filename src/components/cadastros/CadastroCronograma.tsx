
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CadastroCronograma = () => {
  const [atividades, setAtividades] = useState([
    { 
      id: 1, 
      nome: "Kickoff do Projeto", 
      dataInicio: "2024-01-15", 
      dataFim: "2024-01-15", 
      responsavel: "João Santos",
      status: "Concluído"
    },
    { 
      id: 2, 
      nome: "Mapeamento de Processos", 
      dataInicio: "2024-01-20", 
      dataFim: "2024-03-15", 
      responsavel: "Maria Silva",
      status: "Em Andamento"
    },
    { 
      id: 3, 
      nome: "Identificação de Riscos", 
      dataInicio: "2024-03-01", 
      dataFim: "2024-04-30", 
      responsavel: "Carlos Oliveira",
      status: "Planejado"
    }
  ]);

  const [novaAtividade, setNovaAtividade] = useState({
    nome: "",
    dataInicio: "",
    dataFim: "",
    responsavel: "",
    status: "Planejado"
  });

  const adicionarAtividade = () => {
    if (novaAtividade.nome && novaAtividade.dataInicio && novaAtividade.dataFim) {
      setAtividades([...atividades, { 
        id: atividades.length + 1, 
        ...novaAtividade
      }]);
      setNovaAtividade({ nome: "", dataInicio: "", dataFim: "", responsavel: "", status: "Planejado" });
    }
  };

  const removerAtividade = (id: number) => {
    setAtividades(atividades.filter(a => a.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800";
      case "Em Andamento": return "bg-blue-100 text-blue-800";
      case "Planejado": return "bg-yellow-100 text-yellow-800";
      case "Atrasado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calcularDuracao = (inicio: string, fim: string) => {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Cronograma do Projeto</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Atividade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeAtividade">Nome da Atividade</Label>
                <Input
                  id="nomeAtividade"
                  value={novaAtividade.nome}
                  onChange={(e) => setNovaAtividade({...novaAtividade, nome: e.target.value})}
                  placeholder="Ex: Levantamento de requisitos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={novaAtividade.dataInicio}
                    onChange={(e) => setNovaAtividade({...novaAtividade, dataInicio: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={novaAtividade.dataFim}
                    onChange={(e) => setNovaAtividade({...novaAtividade, dataFim: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={novaAtividade.responsavel}
                  onChange={(e) => setNovaAtividade({...novaAtividade, responsavel: e.target.value})}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusAtividade">Status</Label>
                <Select onValueChange={(value) => setNovaAtividade({...novaAtividade, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planejado">Planejado</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={adicionarAtividade} className="w-full">
                Adicionar Atividade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {atividades.map((atividade) => (
          <Card key={atividade.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-800">{atividade.nome}</h4>
                    <Badge className={getStatusColor(atividade.status)}>
                      {atividade.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(atividade.dataInicio).toLocaleDateString()} - {new Date(atividade.dataFim).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Duração:</span> {calcularDuracao(atividade.dataInicio, atividade.dataFim)} dias
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Responsável:</span> {atividade.responsavel}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removerAtividade(atividade.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CadastroCronograma;
