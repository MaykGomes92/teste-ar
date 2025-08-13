import { useState, useEffect } from "react";
import WaveLoading from "@/components/ui/wave-loading";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, Users, Briefcase, Settings, Waves, User, Copy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock data para sponsors - em um projeto real, isso viria do cadastro de usuários
const mockSponsors = [
  { id: "550e8400-e29b-41d4-a716-446655440000", nome: "Ana Silva" },
  { id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", nome: "Carlos Santos" },
  { id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8", nome: "Maria Oliveira" },
  { id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8", nome: "João Pereira" }
];

interface ProjectInfo {
  id: string;
  nome_projeto: string;
  cliente: string;
  data_inicio: string;
  data_fim: string;
  sponsor_principal?: string;
  objetivo_projeto: string;
  created_at: string;
  updated_at: string;
}

const ProjectSelector = ({ onProjectSelect }: { onProjectSelect: (project: any) => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateProject, setTemplateProject] = useState<ProjectInfo | null>(null);
  const [useTemplate, setUseTemplate] = useState(false);
  
  // Form state for new project - sempre iniciado limpo
  const [newProjectForm, setNewProjectForm] = useState({
    nomeProjeto: "",
    cliente: "",
    dataInicio: "",
    dataFim: "",
    sponsorPrincipal: "none",
    objetivoProjeto: ""
  });

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;

      try {
        // Timeout para evitar travamentos na consulta
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        );

        const projectsPromise = supabase
          .from('project_info')
          .select('*')
          .order('created_at', { ascending: false });

        const { data, error } = await Promise.race([projectsPromise, timeoutPromise]) as any;

        if (error) {
          if (error.message === 'Timeout') {
            console.warn('Timeout ao carregar projetos - tentando busca simples');
            // Fallback para busca mais simples
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('project_info')
              .select('id, nome_projeto, cliente, data_inicio, data_fim, objetivo_projeto, created_at, updated_at, user_id')
              .order('created_at', { ascending: false })
              .limit(10);
            
            if (!fallbackError && fallbackData) {
              // Filtrar projetos - remover projeto exemplo que agora está na demo
              const filteredProjects = fallbackData.filter(p => p.id !== 'c0a80000-0000-4000-8000-000000000001');
              setProjects(filteredProjects);
              const template = filteredProjects.find(p => 
                p.id === 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01' || p.cliente?.includes('Empresa ABC')
              );
              if (template) {
                setTemplateProject(template);
                
                // Popular dados complementares em background
                ensureTemplateDataPopulated(template.id).catch(err => 
                  console.warn('Erro ao popular dados do template:', err)
                );
              }
            }
          } else {
            console.error('Erro ao carregar projetos:', error);
          }
          return;
        }

        console.log('Projetos carregados:', data);
        console.log('Buscando projeto Empresa ABC nos dados:', data?.map(p => ({ cliente: p.cliente, nome: p.nome_projeto, id: p.id })));
        // Filtrar projetos - remover projeto exemplo que agora está na demo
        const filteredProjects = (data || []).filter(p => p.id !== 'c0a80000-0000-4000-8000-000000000001');
        setProjects(filteredProjects);
        
        // Identificar projeto template
        const template = filteredProjects.find(p => {
          console.log('Verificando projeto:', p.cliente, p.id);
          // Template fixo é aquele com ID específico ou primeiro na lista
          return p.id === 'bedaf5d7-aa02-4d46-a692-e16a5acd5e01' || p.cliente?.includes('Empresa ABC');
        });
        console.log('Template encontrado:', template);
        if (template) {
          setTemplateProject(template);
          
          // Popular dados complementares em background (não bloquear UI)
          ensureTemplateDataPopulated(template.id).catch(err => 
            console.warn('Erro ao popular dados do template:', err)
          );
        } else {
          console.warn('Projeto template não encontrado nos dados carregados');
        }
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  const ensureTemplateDataPopulated = async (projectId: string) => {
    try {
      // Verificar se já existem riscos para o projeto template
      const { data: risks } = await supabase
        .from('riscos')
        .select('id')
        .eq('project_info_id', projectId)
        .limit(1);

      // Se não há riscos, popular os dados
      if (!risks || risks.length === 0) {
        console.log('Populando dados complementares do projeto template...');
        
        const { data, error } = await supabase.functions.invoke('populate-empresaabc-data', {
          body: { projectId }
        });

        if (error) {
          console.error('Erro ao popular dados do template:', error);
        } else {
          console.log('Dados do template populados com sucesso:', data);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/popular dados do template:', error);
    }
  };

  const handleNewProjectFormChange = (field: string, value: string) => {
    setNewProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetNewProjectForm = () => {
    setNewProjectForm({
      nomeProjeto: "",
      cliente: "",
      dataInicio: "",
      dataFim: "",
      sponsorPrincipal: "none",
      objetivoProjeto: ""
    });
  };

  const createNewProject = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    if (!newProjectForm.nomeProjeto || !newProjectForm.cliente || !newProjectForm.dataInicio || !newProjectForm.dataFim || !newProjectForm.objetivoProjeto) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Nome do Projeto, Cliente, Datas e Objetivo)",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingProject(true);

    try {
      // Se usar template, chamar a edge function
      if (useTemplate && templateProject) {
        const { data, error } = await supabase.functions.invoke('create-project-from-template', {
          body: {
            templateId: templateProject.id,
            newProjectData: {
              nome_projeto: newProjectForm.nomeProjeto,
              cliente: newProjectForm.cliente,
              data_inicio: newProjectForm.dataInicio,
              data_fim: newProjectForm.dataFim,
              sponsor_principal: newProjectForm.sponsorPrincipal === "none" ? null : newProjectForm.sponsorPrincipal,
              objetivo_projeto: newProjectForm.objetivoProjeto
            },
            userId: user.id
          }
        });

        if (error) throw error;

        setProjects(prev => [data.project, ...prev]);
        resetNewProjectForm();
        setUseTemplate(false);
        setIsDialogOpen(false);

        toast({
          title: "Sucesso",
          description: "Projeto criado a partir do template com sucesso!",
        });

        return;
      }

      // Criação normal de projeto (sem template)
      const projectData = {
        user_id: user.id,
        nome_projeto: newProjectForm.nomeProjeto,
        cliente: newProjectForm.cliente,
        data_inicio: newProjectForm.dataInicio,
        data_fim: newProjectForm.dataFim,
        sponsor_principal: newProjectForm.sponsorPrincipal === "none" ? null : newProjectForm.sponsorPrincipal,
        objetivo_projeto: newProjectForm.objetivoProjeto,
        updated_at: new Date().toISOString()
      };

      console.log("Dados do projeto a serem salvos:", projectData);

      const { data, error } = await supabase
        .from('project_info')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao criar projeto:', error);
        throw error;
      }

      // Criar detalhes iniciais do projeto
      const projectDetailsData = {
        project_info_id: data.id,
        user_id: user.id,
        status_projeto: 'Em Andamento',
        progresso_percentual: 0,
        processos_mapeados: 0,
        processos_meta: 60,
        riscos_identificados: 0,
        riscos_meta: 150,
        controles_implementados: 0,
        controles_meta: 120,
        acoes_melhoria: 0,
        acoes_melhoria_meta: 30
      };

      const { error: detailsError } = await supabase
        .from('project_details')
        .insert(projectDetailsData);

      if (detailsError) {
        console.error('Erro ao criar detalhes do projeto:', detailsError);
      }

      // Registrar no histórico
      const { error: historyError } = await supabase
        .from('project_history')
        .insert({
          project_info_id: data.id,
          user_id: user.id,
          tipo_mudanca: 'criacao',
          descricao_mudanca: `Projeto "${data.nome_projeto}" criado`,
          dados_novos: data
        });

      if (historyError) {
        console.error('Erro ao registrar no histórico:', historyError);
      }

      // Associar usuário ao projeto
      await supabase
        .from('project_users')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      setProjects(prev => [data, ...prev]);
      resetNewProjectForm();
      setIsDialogOpen(false);

      toast({
        title: "Sucesso",
        description: "Novo projeto criado com sucesso!"
      });

      console.log("Novo projeto criado:", data);
    } catch (error) {
      console.error('Erro ao criar novo projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar novo projeto. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const getSponsorName = (sponsorId?: string) => {
    if (!sponsorId) return "Não informado";
    const sponsor = mockSponsors.find(s => s.id === sponsorId);
    return sponsor?.nome || "Não informado";
  };

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    onProjectSelect(project);
  };

  const handleDialogOpen = () => {
    // Sempre limpar o formulário quando abrir o dialog
    resetNewProjectForm();
    setUseTemplate(false);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6 flex items-center justify-center">
        <WaveLoading size="lg" text="Carregando projetos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                O
              </div>
              Sistema de Gestão de Projetos
            </h1>
            <p className="text-slate-600 mt-2">Sistema de Gestão de Projetos e Controles Internos</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-accent" onClick={handleDialogOpen}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Configure um novo projeto de consultoria. Todos os campos marcados com * são obrigatórios.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="projectName">Nome do Projeto *</Label>
                    <Input 
                      id="projectName" 
                      placeholder="Ex: Controles Internos - Empresa ABC"
                      value={newProjectForm.nomeProjeto}
                      onChange={(e) => handleNewProjectFormChange("nomeProjeto", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Input 
                      id="client" 
                      placeholder="Nome da empresa cliente"
                      value={newProjectForm.cliente}
                      onChange={(e) => handleNewProjectFormChange("cliente", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsor">Sponsor Principal (Opcional)</Label>
                    <Select value={newProjectForm.sponsorPrincipal} onValueChange={(value) => handleNewProjectFormChange("sponsorPrincipal", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sponsor (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum sponsor selecionado</SelectItem>
                        {mockSponsors.map((sponsor) => (
                          <SelectItem key={sponsor.id} value={sponsor.id}>
                            {sponsor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início *</Label>
                    <Input 
                      id="startDate" 
                      type="date"
                      value={newProjectForm.dataInicio}
                      onChange={(e) => handleNewProjectFormChange("dataInicio", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término *</Label>
                    <Input 
                      id="endDate" 
                      type="date"
                      value={newProjectForm.dataFim}
                      onChange={(e) => handleNewProjectFormChange("dataFim", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Objetivo do Projeto *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva o escopo e objetivos do projeto"
                      value={newProjectForm.objetivoProjeto}
                      onChange={(e) => handleNewProjectFormChange("objetivoProjeto", e.target.value)}
                    />
                  </div>
                  
                  {templateProject && (
                    <div className="col-span-2 space-y-3">
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Checkbox 
                          id="useTemplate" 
                          checked={useTemplate}
                          onCheckedChange={(checked) => setUseTemplate(checked === true)}
                        />
                        <Label htmlFor="useTemplate" className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            Usar template padrão do sistema
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            Inclui estrutura de processos, riscos e controles já configurados
                          </div>
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-accent"
                  onClick={createNewProject}
                  disabled={isCreatingProject}
                >
                  {isCreatingProject ? "Criando..." : "Criar Projeto"}
                </Button>
              </DialogContent>
            </Dialog>
            
            <Link to="/landing" className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg shadow-md hover:from-accent hover:to-secondary transition-all">
              <Waves className="w-5 h-5" />
              <span className="font-semibold">Orla</span>
            </Link>
          </div>
        </div>

        {/* Project Cards */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id}
                className="bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={() => handleProjectSelect(project)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {project.cliente} - {project.nome_projeto}
                      </CardTitle>
                      <CardDescription>{project.objetivo_projeto}</CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Em Andamento
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span>{project.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{new Date(project.data_inicio).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      <span>{getSponsorName(project.sponsor_principal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>75%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progresso</span>
                      <span className="font-semibold text-slate-800">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    Acessar Projeto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhum projeto encontrado</h3>
            <p className="text-slate-600 mb-4">
              Clique em "Novo Projeto" para criar seu primeiro projeto de consultoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;
