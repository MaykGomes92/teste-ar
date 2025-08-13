
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, AlertTriangle, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const CadastroColunasRiscos = () => {
  const [colunas, setColunas] = useState([
    { 
      id: 1, 
      nome: "Categoria do Risco", 
      tipo: "Lista", 
      opcoes: ["Operacional", "Financeiro", "Estratégico", "Compliance", "Reputacional", "Ambiental"],
      obrigatorio: true
    },
    { 
      id: 2, 
      nome: "Probabilidade", 
      tipo: "Lista", 
      opcoes: ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"],
      obrigatorio: true
    },
    { 
      id: 3, 
      nome: "Impacto", 
      tipo: "Lista", 
      opcoes: ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"],
      obrigatorio: true
    },
    { 
      id: 4, 
      nome: "Descrição do Risco", 
      tipo: "Texto", 
      opcoes: [],
      obrigatorio: true
    }
  ]);

  const [novaColuna, setNovaColuna] = useState({
    nome: "",
    tipo: "",
    opcoes: "",
    obrigatorio: false
  });

  const adicionarColuna = () => {
    if (novaColuna.nome && novaColuna.tipo) {
      const opcoesArray = novaColuna.tipo === "Lista" 
        ? novaColuna.opcoes.split(',').map(o => o.trim()).filter(o => o)
        : [];
      
      setColunas([...colunas, { 
        id: colunas.length + 1, 
        nome: novaColuna.nome,
        tipo: novaColuna.tipo,
        opcoes: opcoesArray,
        obrigatorio: novaColuna.obrigatorio
      }]);
      setNovaColuna({ nome: "", tipo: "", opcoes: "", obrigatorio: false });
    }
  };

  const removerColuna = (id: number) => {
    setColunas(colunas.filter(c => c.id !== id));
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Lista": return "bg-blue-100 text-blue-800";
      case "Texto": return "bg-green-100 text-green-800";
      case "Número": return "bg-purple-100 text-purple-800";
      case "Data": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Colunas para Riscos</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Coluna</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeColuna">Nome da Coluna</Label>
                <Input
                  id="nomeColuna"
                  value={novaColuna.nome}
                  onChange={(e) => setNovaColuna({...novaColuna, nome: e.target.value})}
                  placeholder="Ex: Nível de Criticidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipoColuna">Tipo de Campo</Label>
                <Select onValueChange={(value) => setNovaColuna({...novaColuna, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lista">Lista de Opções</SelectItem>
                    <SelectItem value="Texto">Texto Livre</SelectItem>
                    <SelectItem value="Número">Número</SelectItem>
                    <SelectItem value="Data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {novaColuna.tipo === "Lista" && (
                <div className="space-y-2">
                  <Label htmlFor="opcoes">Opções (separadas por vírgula)</Label>
                  <Textarea
                    id="opcoes"
                    value={novaColuna.opcoes}
                    onChange={(e) => setNovaColuna({...novaColuna, opcoes: e.target.value})}
                    placeholder="Ex: Opção 1, Opção 2, Opção 3"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="obrigatorioColunaRisco"
                  checked={novaColuna.obrigatorio}
                  onChange={(e) => setNovaColuna({...novaColuna, obrigatorio: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="obrigatorioColunaRisco">Campo obrigatório</Label>
              </div>
              <Button onClick={adicionarColuna} className="w-full">
                Adicionar Coluna
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {colunas.map((coluna) => (
          <Card key={coluna.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-slate-500" />
                    <h4 className="font-semibold text-slate-800">{coluna.nome}</h4>
                    <Badge className={getTipoColor(coluna.tipo)}>
                      {coluna.tipo}
                    </Badge>
                    {coluna.obrigatorio && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                  {coluna.opcoes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <List className="w-4 h-4" />
                        <span className="font-medium">Opções disponíveis:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {coluna.opcoes.map((opcao, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {opcao}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removerColuna(coluna.id)}
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

export default CadastroColunasRiscos;
