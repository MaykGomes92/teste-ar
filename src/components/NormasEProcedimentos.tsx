import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Search,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  CalendarIcon,
  GitBranch,
  History,
  AlertTriangle,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NormaOuProcedimento {
  id: string;
  project_info_id: string;
  user_id?: string;
  tipo: 'norma' | 'procedimento';
  codigo: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  area?: string;
  status: 'ativo' | 'revisao' | 'obsoleto' | 'expirado';
  arquivo_path?: string;
  arquivo_name?: string;
  created_at: string;
  updated_at: string;
  versao_ativa?: VersaoNorma;
}

interface VersaoNorma {
  id: string;
  versao: string;
  data_inicio: string;
  data_fim?: string;
  data_expiracao?: string;
  data_aprovacao?: string;
  proxima_revisao?: string;
  aprovado_por?: string;
  observacoes?: string;
  ativo: boolean;
}

interface NormasEProcedimentosProps {
  selectedProjectId?: string;
}

const NormasEProcedimentos = ({ selectedProjectId }: NormasEProcedimentosProps) => {
  const [dados, setDados] = useState<NormaOuProcedimento[]>([]);
  const [versoes, setVersoes] = useState<VersaoNorma[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedNorma, setSelectedNorma] = useState<string | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    tipo: '',
    codigo: '',
    titulo: '',
    descricao: '',
    responsavel: '',
    area: ''
  });
  
  const [versionData, setVersionData] = useState({
    versao: '',
    data_expiracao: undefined as Date | undefined,
    data_aprovacao: undefined as Date | undefined,
    proxima_revisao: undefined as Date | undefined,
    aprovado_por: '',
    observacoes: ''
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProjectId) {
      loadNormas();
    }
  }, [selectedProjectId]);

  const loadNormas = async () => {
    if (!selectedProjectId) return;
    
    try {
      setLoading(true);
      
      // Buscar normas com suas versões ativas
      const { data: normas, error: normasError } = await supabase
        .from('normas_procedimentos')
        .select(`
          *,
          versao_ativa:normas_procedimentos_versoes!inner(*)
        `)
        .eq('project_info_id', selectedProjectId)
        .eq('normas_procedimentos_versoes.ativo', true);

      if (normasError) throw normasError;

      const normasComVersao = normas?.map(norma => ({
        ...norma,
        tipo: norma.tipo as 'norma' | 'procedimento',
        status: norma.status as 'ativo' | 'revisao' | 'obsoleto' | 'expirado',
        versao_ativa: norma.versao_ativa?.[0]
      })) || [];

      setDados(normasComVersao as NormaOuProcedimento[]);
    } catch (error) {
      console.error('Erro ao carregar normas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as normas e procedimentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (normaId: string) => {
    try {
      const { data, error } = await supabase
        .from('normas_procedimentos_versoes')
        .select('*')
        .eq('norma_procedimento_id', normaId)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setVersoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar versões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive"
      });
    }
  };

  const dadosFiltrados = dados.filter(item => {
    const matchTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || item.status === filtroStatus;
    const matchBusca = termoBusca === '' || 
      item.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
      item.codigo.toLowerCase().includes(termoBusca.toLowerCase());
    
    return matchTipo && matchStatus && matchBusca;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'revisao':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'obsoleto':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'expirado':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'revisao':
        return 'bg-yellow-100 text-yellow-800';
      case 'obsoleto':
        return 'bg-red-100 text-red-800';
      case 'expirado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (dataExpiracao?: string) => {
    if (!dataExpiracao) return false;
    const today = new Date();
    const expiry = new Date(dataExpiracao);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const handleSubmit = async () => {
    if (!selectedProjectId) return;
    
    try {
      // Inserir norma
      const { data: norma, error: normaError } = await supabase
        .from('normas_procedimentos')
        .insert({
          project_info_id: selectedProjectId,
          tipo: formData.tipo,
          codigo: formData.codigo,
          titulo: formData.titulo,
          descricao: formData.descricao,
          responsavel: formData.responsavel,
          area: formData.area
        })
        .select()
        .single();

      if (normaError) throw normaError;

      // Inserir primeira versão
      const { error: versaoError } = await supabase
        .from('normas_procedimentos_versoes')
        .insert({
          norma_procedimento_id: norma.id,
          versao: '1.0',
          data_inicio: new Date().toISOString().split('T')[0],
          ativo: true
        });

      if (versaoError) throw versaoError;

      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso."
      });

      setIsDialogOpen(false);
      setFormData({
        tipo: '',
        codigo: '',
        titulo: '',
        descricao: '',
        responsavel: '',
        area: ''
      });
      
      loadNormas();
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o documento.",
        variant: "destructive"
      });
    }
  };

  const handleNewVersion = async () => {
    if (!selectedNorma) return;
    
    try {
      const { data, error } = await supabase.rpc('create_new_version', {
        p_norma_id: selectedNorma,
        p_versao: versionData.versao,
        p_data_inicio: new Date().toISOString().split('T')[0],
        p_data_expiracao: versionData.data_expiracao?.toISOString().split('T')[0],
        p_aprovado_por: versionData.aprovado_por,
        p_observacoes: versionData.observacoes
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Nova versão criada com sucesso."
      });

      setIsVersionDialogOpen(false);
      setVersionData({
        versao: '',
        data_expiracao: undefined,
        data_aprovacao: undefined,
        proxima_revisao: undefined,
        aprovado_por: '',
        observacoes: ''
      });
      
      loadNormas();
    } catch (error) {
      console.error('Erro ao criar versão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a nova versão.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('normas_procedimentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso."
      });
      
      loadNormas();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o documento.",
        variant: "destructive"
      });
    }
  };

  const handleViewHistory = (normaId: string) => {
    setSelectedNorma(normaId);
    loadVersions(normaId);
    setIsHistoryDialogOpen(true);
  };

  const handleCreateVersion = (normaId: string) => {
    setSelectedNorma(normaId);
    setIsVersionDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Normas e Procedimentos
            </h2>
            <p className="text-slate-600">Gerencie documentos normativos com controle de versão e datas de expiração</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Voltar ao Projeto
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Documento
            </Button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título ou código..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="norma">Normas</SelectItem>
              <SelectItem value="procedimento">Procedimentos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="revisao">Em Revisão</SelectItem>
              <SelectItem value="obsoleto">Obsoleto</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{dados.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {dados.filter(d => d.status === 'ativo').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Revisão</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dados.filter(d => d.status === 'revisao').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-red-600">
                  {dados.filter(d => d.status === 'expirado').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirando</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dados.filter(d => isExpiringSoon(d.versao_ativa?.data_expiracao)).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Lista de normas e procedimentos com controle de versão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Versão Atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Expiração</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant={item.tipo === 'norma' ? 'default' : 'secondary'}>
                        {item.tipo === 'norma' ? 'Norma' : 'Procedimento'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{item.codigo}</TableCell>
                    <TableCell className="font-medium">{item.titulo}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-gray-500" />
                        {item.versao_ativa?.versao || '1.0'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                        {isExpiringSoon(item.versao_ativa?.data_expiracao) && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Expira em breve
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.versao_ativa?.data_expiracao ? 
                        new Date(item.versao_ativa.data_expiracao).toLocaleDateString('pt-BR') : 
                        'Sem data'
                      }
                    </TableCell>
                    <TableCell>{item.responsavel}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCreateVersion(item.id)}
                          title="Nova versão"
                        >
                          <GitBranch className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewHistory(item.id)}
                          title="Histórico de versões"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para novo documento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Documento</DialogTitle>
            <DialogDescription>
              Adicione uma nova norma ou procedimento ao sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="norma">Norma</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input 
                  id="codigo" 
                  placeholder="Ex: NOR-001"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input 
                id="titulo" 
                placeholder="Título do documento"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao" 
                placeholder="Descrição do documento"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="area">Área</Label>
                <Input 
                  id="area" 
                  placeholder="Área responsável"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para nova versão */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Versão</DialogTitle>
            <DialogDescription>
              Criar uma nova versão do documento selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versao">Número da Versão</Label>
                <Input 
                  id="versao" 
                  placeholder="Ex: 2.0"
                  value={versionData.versao}
                  onChange={(e) => setVersionData({...versionData, versao: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aprovado_por">Aprovado Por</Label>
                <Input 
                  id="aprovado_por" 
                  placeholder="Nome do aprovador"
                  value={versionData.aprovado_por}
                  onChange={(e) => setVersionData({...versionData, aprovado_por: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !versionData.data_expiracao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {versionData.data_expiracao ? format(versionData.data_expiracao, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={versionData.data_expiracao}
                      onSelect={(date) => setVersionData({...versionData, data_expiracao: date})}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Próxima Revisão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !versionData.proxima_revisao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {versionData.proxima_revisao ? format(versionData.proxima_revisao, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={versionData.proxima_revisao}
                      onSelect={(date) => setVersionData({...versionData, proxima_revisao: date})}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Observações sobre esta versão"
                value={versionData.observacoes}
                onChange={(e) => setVersionData({...versionData, observacoes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNewVersion}>
              Criar Versão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para histórico de versões */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Histórico de Versões</DialogTitle>
            <DialogDescription>
              Visualize todas as versões do documento
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Data Expiração</TableHead>
                  <TableHead>Aprovado Por</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versoes.map((versao) => (
                  <TableRow key={versao.id}>
                    <TableCell className="font-mono">{versao.versao}</TableCell>
                    <TableCell>{new Date(versao.data_inicio).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      {versao.data_fim ? new Date(versao.data_fim).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>
                      {versao.data_expiracao ? new Date(versao.data_expiracao).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell>{versao.aprovado_por || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={versao.ativo ? 'default' : 'secondary'}>
                        {versao.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NormasEProcedimentos;