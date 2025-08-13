
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CadastroInformacoesProjeto = ({ selectedProjectId }: { selectedProjectId?: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nomeProjeto: "",
    cliente: "",
    dataInicio: "",
    dataFim: "",
    sponsorPrincipal: "",
    objetivoProjeto: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Carregar dados existentes do projeto específico
  useEffect(() => {
    const loadProjectInfo = async () => {
      if (!user || !selectedProjectId) return;

      try {
        const { data, error } = await supabase
          .from('project_info')
          .select('*')
          .eq('id', selectedProjectId)
          .single();

        if (error) {
          console.error('Erro ao carregar informações do projeto:', error);
          return;
        }

        if (data) {
          setProjectId(data.id);
          setFormData({
            nomeProjeto: data.nome_projeto || "",
            cliente: data.cliente || "",
            dataInicio: data.data_inicio || "",
            dataFim: data.data_fim || "",
            sponsorPrincipal: data.sponsor_principal || "",
            objetivoProjeto: data.objetivo_projeto || ""
          });
        }
      } catch (error) {
        console.error('Erro ao carregar informações do projeto:', error);
      }
    };

    loadProjectInfo();
  }, [user, selectedProjectId]);

  const handleSave = async () => {
    if (!user || !selectedProjectId) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou projeto não selecionado",
        variant: "destructive"
      });
      return;
    }

    // Validação básica
    if (!formData.nomeProjeto || !formData.cliente || !formData.dataInicio || !formData.dataFim || !formData.objetivoProjeto) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const projectData = {
        user_id: user.id,
        nome_projeto: formData.nomeProjeto,
        cliente: formData.cliente,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim,
        sponsor_principal: formData.sponsorPrincipal || null,
        objetivo_projeto: formData.objetivoProjeto,
        updated_at: new Date().toISOString()
      };

      let result;

      if (projectId) {
        // Atualizar projeto existente
        result = await supabase
          .from('project_info')
          .update(projectData)
          .eq('id', selectedProjectId)
          .select()
          .single();
      } else {
        // Criar novo projeto
        result = await supabase
          .from('project_info')
          .insert(projectData)
          .select()
          .single();
        
        if (result.data) {
          setProjectId(result.data.id);
        }
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Sucesso",
        description: projectId ? "Informações do projeto atualizadas com sucesso!" : "Informações do projeto salvas com sucesso!"
      });

      console.log("Informações do projeto salvas:", projectData);
    } catch (error) {
      console.error('Erro ao salvar informações do projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar informações do projeto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedProjectId ? (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <p className="text-yellow-800 text-center">
              Selecione um projeto para visualizar e editar suas informações.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações do Projeto
              </CardTitle>
            </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nomeProjeto">Nome do Projeto *</Label>
              <Input
                id="nomeProjeto"
                value={formData.nomeProjeto}
                onChange={(e) => handleInputChange("nomeProjeto", e.target.value)}
                placeholder="Digite o nome do projeto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => handleInputChange("cliente", e.target.value)}
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange("dataInicio", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim *</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => handleInputChange("dataFim", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorPrincipal">Sponsor</Label>
              <Input
                id="sponsorPrincipal"
                value={formData.sponsorPrincipal}
                onChange={(e) => handleInputChange("sponsorPrincipal", e.target.value)}
                placeholder="Digite o nome do sponsor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivoProjeto">Objetivo do Projeto *</Label>
            <Textarea
              id="objetivoProjeto"
              value={formData.objetivoProjeto}
              onChange={(e) => handleInputChange("objetivoProjeto", e.target.value)}
              placeholder="Descreva o objetivo principal do projeto"
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Salvando..." : "Salvar Informações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-slate-600">Projeto:</span>
              <p className="text-slate-800">{formData.nomeProjeto || "Não informado"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Cliente:</span>
              <p className="text-slate-800">{formData.cliente || "Não informado"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Período:</span>
              <p className="text-slate-800">
                {formData.dataInicio && formData.dataFim 
                  ? `${new Date(formData.dataInicio).toLocaleDateString()} - ${new Date(formData.dataFim).toLocaleDateString()}`
                  : "Não informado"
                }
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Sponsor:</span>
              <p className="text-slate-800">{formData.sponsorPrincipal || "Não informado"}</p>
            </div>
          </div>
          {formData.objetivoProjeto && (
            <div className="mt-4">
              <span className="font-semibold text-slate-600">Objetivo:</span>
              <p className="text-slate-800 mt-1">{formData.objetivoProjeto}</p>
            </div>
          )}
        </CardContent>
        </Card>
        </>
      )}
    </div>
  );
};

export default CadastroInformacoesProjeto;
