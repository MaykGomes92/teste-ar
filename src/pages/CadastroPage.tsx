import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Mail, User, Phone, Briefcase, Shield, Info, Users, Building, Home, ArrowLeft } from "lucide-react";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import NextGenHeader from '@/components/NextGenHeader';
import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const CadastroPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    perfil: "",
  });

  const perfisDisponiveis = [
    {
      nome: "Orla - Diretor",
      permissoes: "Administração, Edição, Consulta, Aprovação"
    },
    {
      nome: "Orla - Gerência do Projeto",
      permissoes: "Administração, Edição, Consulta, Aprovação"
    },
    {
      nome: "Orla - Consultores",
      permissoes: "Edição, Consulta, Aprovação"
    },
    {
      nome: "Cliente - Alta Liderança",
      permissoes: "Edição, Consulta, Aprovação"
    },
    {
      nome: "Cliente - Diretor de Controles Internos",
      permissoes: "Consulta, Aprovação"
    },
    {
      nome: "Cliente - Analista de Controles Internos",
      permissoes: "Edição, Consulta, Aprovação"
    },
    {
      nome: "Cliente - Diretor de Processos",
      permissoes: "Edição, Consulta, Aprovação"
    },
    {
      nome: "Cliente - Gerente de Processos",
      permissoes: "Consulta, Aprovação"
    },
    {
      nome: "Cliente - ponto focal de Processos",
      permissoes: "Edição, Consulta, Aprovação"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current session to include in request
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      if (!selectedProjectId) {
        throw new Error('Nenhum projeto selecionado');
      }

      // Check if user has permission to create invitations for this project
      const { data: projectUser } = await supabase
        .from('project_users')
        .select('role')
        .eq('project_id', selectedProjectId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!projectUser || !['admin', 'manager'].includes(projectUser.role)) {
        throw new Error('Você não tem permissão para cadastrar usuários neste projeto');
      }

      // Call edge function to send invitation
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: formData.email,
          nome: formData.nome,
          telefone: formData.telefone,
          cargo: formData.cargo,
          perfil: formData.perfil,
          project_id: selectedProjectId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Convite enviado com sucesso!",
        description: `Um email de convite foi enviado para ${formData.email}`,
      });

      handleSubmitSuccess();

    } catch (error: any) {
      console.error('Erro ao enviar convite:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedProfile = perfisDisponiveis.find(p => p.nome === formData.perfil);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('project_info')
        .select('id, nome_projeto, cliente')
        .order('nome_projeto');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar a lista de projetos.",
        variant: "destructive",
      });
    }
  };

  const fetchCurrentProject = async () => {
    try {
      if (!selectedProjectId) return;
      
      const { data, error } = await supabase
        .from('project_info')
        .select('id, nome_projeto, cliente')
        .eq('id', selectedProjectId)
        .single();

      if (error) throw error;
      setCurrentProject(data);
    } catch (error) {
      console.error('Erro ao buscar projeto atual:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      if (!selectedProjectId) {
        setUsuarios([]);
        return;
      }

      // Fetch users for the current project
      const { data, error } = await supabase
        .from('project_users')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            nome,
            telefone,
            cargo,
            perfil
          )
        `)
        .eq('project_id', selectedProjectId);

      if (error) throw error;
      
      const formattedUsers = data?.map(item => ({
        id: item.user_id,
        nome: item.profiles?.nome,
        telefone: item.profiles?.telefone,
        cargo: item.profiles?.cargo,
        perfil: item.profiles?.perfil,
        project_role: item.role,
        created_at: item.created_at
      })) || [];
      
      setUsuarios(formattedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsuarios(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchCurrentProject();
    fetchUsuarios();
  }, [selectedProjectId]);

  const handleSubmitSuccess = () => {
    // Reset form
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cargo: "",
      perfil: "",
    });
    // Refresh user list
    fetchUsuarios();
  };

  return (
    <div className="min-h-screen">
      <GlobalHeader />
      <div className="bg-background pt-20">
        <NextGenHeader
        title="Gerenciamento de Cadastros"
        subtitle="Configure e gerencie as informações do sistema"
        badges={{
          cliente: 'Sistema',
          status: 'Ativo'
        }}
        showBackButton={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">

          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Selecionar Projeto
              </CardTitle>
              <CardDescription>
                Escolha o projeto para o qual deseja cadastrar usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="project">Projeto *</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.nome_projeto} - {project.cliente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Novo Convite de Usuário
              </CardTitle>
              <CardDescription>
                Preencha os dados do usuário para enviar o convite por email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProjectId ? (
                <div className="text-center py-8 text-slate-600">
                  <Building className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p>Selecione um projeto para cadastrar usuários</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {currentProject && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Projeto: {currentProject.nome_projeto}
                        </span>
                        {currentProject.cliente && (
                          <span className="text-blue-600">
                            - {currentProject.cliente}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Nome Completo *
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleInputChange('nome', e.target.value)}
                        placeholder="Digite o nome completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Digite o email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefone
                      </Label>
                      <Input
                        id="telefone"
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo" className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Cargo
                      </Label>
                      <Input
                        id="cargo"
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => handleInputChange('cargo', e.target.value)}
                        placeholder="Digite o cargo"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="perfil" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Perfil de Acesso *
                      </Label>
                      <Select value={formData.perfil} onValueChange={(value) => handleInputChange('perfil', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil de acesso" />
                        </SelectTrigger>
                        <SelectContent>
                          {perfisDisponiveis.map((perfil) => (
                            <SelectItem key={perfil.nome} value={perfil.nome}>
                              <div className="flex flex-col">
                                <span className="font-medium">{perfil.nome}</span>
                                <span className="text-xs text-slate-500">{perfil.permissoes}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedProfile && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-800">Permissões do perfil selecionado:</p>
                              <p className="text-sm text-blue-700">{selectedProfile.permissoes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading || !formData.perfil || !selectedProjectId}
                      className="bg-primary hover:bg-accent"
                    >
                      {loading ? "Enviando..." : "Enviar Convite"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuários Cadastrados
              </CardTitle>
              <CardDescription>
                Lista de usuários que já foram cadastrados no projeto selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProjectId ? (
                <div className="text-center py-8 text-slate-600">
                  <Building className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p>Selecione um projeto para ver os usuários</p>
                </div>
              ) : loadingUsuarios ? (
                <div className="flex justify-center py-8">
                  <div className="text-slate-600">Carregando usuários...</div>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <Users className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p>Nenhum usuário cadastrado neste projeto ainda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Perfil de Acesso</TableHead>
                        <TableHead>Papel no Projeto</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">
                            {usuario.nome || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            {usuario.telefone || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            {usuario.cargo || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {usuario.perfil || 'Não definido'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              usuario.project_role === 'admin' ? 'bg-red-100 text-red-800' :
                              usuario.project_role === 'manager' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {usuario.project_role === 'admin' ? 'Administrador' :
                               usuario.project_role === 'manager' ? 'Gerente' : 'Usuário'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default CadastroPage;