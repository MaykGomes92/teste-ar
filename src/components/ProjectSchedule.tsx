import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Save, X, Filter, Download, Upload, ExternalLink, RefreshCw } from "lucide-react";
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  codigo: string;
  macroEtapa: string;
  etapa: string;
  responsavel: string;
  dataInicioPlanned: string;
  dataFimPlanned: string;
  dataInicioReplanned: string;
  dataFimReplanned: string;
  dataInicioReal: string;
  dataFimReal: string;
  status: string;
}

const ProjectSchedule = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      codigo: 'PLAN-001',
      macroEtapa: 'Planejamento',
      etapa: 'Definição do Escopo',
      responsavel: 'João Silva',
      dataInicioPlanned: '2024-01-01',
      dataFimPlanned: '2024-01-07',
      dataInicioReplanned: '',
      dataFimReplanned: '',
      dataInicioReal: '2024-01-01',
      dataFimReal: '2024-01-07',
      status: 'Concluído'
    },
    {
      id: '2',
      codigo: 'MAP-001',
      macroEtapa: 'Mapeamento',
      etapa: 'Identificação de Processos',
      responsavel: 'Maria Santos',
      dataInicioPlanned: '2024-01-08',
      dataFimPlanned: '2024-01-15',
      dataInicioReplanned: '2024-01-10',
      dataFimReplanned: '2024-01-17',
      dataInicioReal: '2024-01-10',
      dataFimReal: '',
      status: 'Em Andamento'
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState({
    macroEtapa: 'all',
    etapa: 'all',
    status: 'all'
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    codigo: '',
    macroEtapa: '',
    etapa: '',
    responsavel: '',
    dataInicioPlanned: '',
    dataFimPlanned: '',
    dataInicioReplanned: '',
    dataFimReplanned: '',
    dataInicioReal: '',
    dataFimReal: ''
  });

  // Estados para o conector Asana
  const [asanaToken, setAsanaToken] = useState('');
  const [asanaProjectId, setAsanaProjectId] = useState('');
  const [showAsanaDialog, setShowAsanaDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Função para sincronização com Asana
  const handleAsanaSync = async () => {
    if (!asanaToken || !asanaProjectId) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha o token e ID do projeto.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      console.log('Iniciando sincronização com Asana...');
      console.log('Token (primeiros 10 caracteres):', asanaToken.substring(0, 10) + '...');
      console.log('Project ID:', asanaProjectId);

      // Validar se o ID do projeto é numérico
      const numericProjectId = asanaProjectId.trim();
      if (!/^\d+$/.test(numericProjectId)) {
        throw new Error("ID do projeto deve conter apenas números. Verifique se você está usando o ID correto do projeto Asana.");
      }

      const response = await fetch(`https://app.asana.com/api/1.0/projects/${numericProjectId}/tasks`, {
        headers: {
          'Authorization': `Bearer ${asanaToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        if (response.status === 404) {
          errorMessage = "Projeto não encontrado. Verifique se o ID do projeto está correto e se você tem acesso a ele. O ID deve ser apenas números.";
        } else if (response.status === 401) {
          errorMessage = "Token de acesso inválido. Verifique se o token está correto e não expirou.";
        } else if (response.status === 403) {
          errorMessage = "Sem permissão para acessar este projeto. Verifique se o token tem as permissões necessárias.";
        } else if (response.status === 400) {
          errorMessage = "ID do projeto inválido. Certifique-se de usar apenas o ID numérico do projeto.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const asanaTasks = data.data.map((task: any, index: number) => ({
          id: `asana-${task.gid}`,
          codigo: `ASANA-${String(index + 1).padStart(3, '0')}`,
          macroEtapa: task.projects?.[0]?.name || 'Importado do Asana',
          etapa: task.name,
          responsavel: task.assignee?.name || 'Não atribuído',
          dataInicioPlanned: task.start_on || '',
          dataFimPlanned: task.due_on || '',
          dataInicioReplanned: '',
          dataFimReplanned: '',
          dataInicioReal: task.start_on || '',
          dataFimReal: task.completed ? (task.completed_at?.split('T')[0] || '') : '',
          status: task.completed ? 'Concluído' : 'Em Andamento'
        }));

        setActivities(prev => {
          // Remove tarefas antigas do Asana e adiciona as novas
          const filteredPrev = prev.filter(activity => !activity.id.startsWith('asana-'));
          return [...filteredPrev, ...asanaTasks];
        });

        toast({
          title: "Sincronização concluída",
          description: `${asanaTasks.length} tarefas importadas do Asana com sucesso.`,
        });
        
        setShowAsanaDialog(false);
      } else {
        throw new Error('Formato de resposta inválido da API do Asana');
      }
    } catch (error) {
      console.error('Erro ao sincronizar com Asana:', error);
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Verifique o token e ID do projeto.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Função para download do cronograma
  const handleDownload = () => {
    const dataForExport = activities.map(activity => ({
      'Código': activity.codigo,
      'Macro Etapa': activity.macroEtapa,
      'Etapa': activity.etapa,
      'Responsável': activity.responsavel,
      'Início Planejado': activity.dataInicioPlanned,
      'Fim Planejado': activity.dataFimPlanned,
      'Início Replanejado': activity.dataInicioReplanned,
      'Fim Replanejado': activity.dataFimReplanned,
      'Início Real': activity.dataInicioReal,
      'Fim Real': activity.dataFimReal,
      'Status': calculateStatus(activity)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cronograma');
    
    const fileName = `cronograma_projeto_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Função para upload do cronograma
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const importedActivities: Activity[] = jsonData.map((row, index) => ({
          id: Date.now().toString() + index,
          codigo: row['Código'] || '',
          macroEtapa: row['Macro Etapa'] || '',
          etapa: row['Etapa'] || '',
          responsavel: row['Responsável'] || '',
          dataInicioPlanned: row['Início Planejado'] || '',
          dataFimPlanned: row['Fim Planejado'] || '',
          dataInicioReplanned: row['Início Replanejado'] || '',
          dataFimReplanned: row['Fim Replanejado'] || '',
          dataInicioReal: row['Início Real'] || '',
          dataFimReal: row['Fim Real'] || '',
          status: row['Status'] || 'Não Iniciado'
        }));

        setActivities(importedActivities);
        
        // Resetar o input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Erro ao importar arquivo:', error);
        alert('Erro ao importar arquivo. Verifique se o formato está correto.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Calcular status automaticamente baseado nas datas
  const calculateStatus = (activity: Activity): string => {
    const today = new Date();
    const dataFimPlanned = new Date(activity.dataFimPlanned);
    const dataFimReplanned = activity.dataFimReplanned ? new Date(activity.dataFimReplanned) : null;
    const dataFimReal = activity.dataFimReal ? new Date(activity.dataFimReal) : null;

    if (dataFimReal) {
      const targetDate = dataFimReplanned || dataFimPlanned;
      return dataFimReal <= targetDate ? 'Concluído' : 'Concluído com Atraso';
    }

    if (!activity.dataInicioReal) {
      const targetStartDate = activity.dataInicioReplanned ? new Date(activity.dataInicioReplanned) : new Date(activity.dataInicioPlanned);
      return today < targetStartDate ? 'Não Iniciado' : 'Não Iniciado (Atrasado)';
    }

    const targetEndDate = dataFimReplanned || dataFimPlanned;
    return today <= targetEndDate ? 'Em Andamento' : 'Em Andamento (Atrasado)';
  };

  // Obter listas únicas para filtros
  const uniqueMacroEtapas = [...new Set(activities.map(a => a.macroEtapa))];
  const uniqueEtapas = [...new Set(activities.map(a => a.etapa))];
  const uniqueStatus = [...new Set(activities.map(a => calculateStatus(a)))];

  // Filtrar atividades
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const status = calculateStatus(activity);
      return (
        (filters.macroEtapa === 'all' || activity.macroEtapa === filters.macroEtapa) &&
        (filters.etapa === 'all' || activity.etapa === filters.etapa) &&
        (filters.status === 'all' || status === filters.status)
      );
    });
  }, [activities, filters]);

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditingActivity({ ...activity });
  };

  const handleSave = () => {
    if (editingActivity) {
      setActivities(prev => prev.map(a => 
        a.id === editingActivity.id ? editingActivity : a
      ));
      setEditingId(null);
      setEditingActivity(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingActivity(null);
  };

  const handleAddActivity = () => {
    if (newActivity.codigo && newActivity.macroEtapa && newActivity.etapa) {
      const activity: Activity = {
        ...newActivity as Activity,
        id: Date.now().toString(),
        status: 'Não Iniciado'
      };
      setActivities(prev => [...prev, activity]);
      setNewActivity({
        codigo: '',
        macroEtapa: '',
        etapa: '',
        responsavel: '',
        dataInicioPlanned: '',
        dataFimPlanned: '',
        dataInicioReplanned: '',
        dataFimReplanned: '',
        dataInicioReal: '',
        dataFimReal: ''
      });
      setShowNewActivity(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Concluído': 'bg-green-100 text-green-800',
      'Concluído com Atraso': 'bg-orange-100 text-orange-800',
      'Em Andamento': 'bg-blue-100 text-blue-800',
      'Em Andamento (Atrasado)': 'bg-red-100 text-red-800',
      'Não Iniciado': 'bg-gray-100 text-gray-800',
      'Não Iniciado (Atrasado)': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Cronograma do Projeto - Planilha Editável
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Excel
              </Button>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Excel
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUpload}
                className="hidden"
              />
              <Dialog open={showAsanaDialog} onOpenChange={setShowAsanaDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Conectar Asana
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Conectar com Asana</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="asanaToken">Token de Acesso Pessoal do Asana</Label>
                      <Input
                        id="asanaToken"
                        type="password"
                        placeholder="0/1a2b3c4d5e6f7g8h9i0j..."
                        value={asanaToken}
                        onChange={(e) => setAsanaToken(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Obtenha seu token em: Asana → Meu Perfil → Apps → Tokens de Acesso Pessoal
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="asanaProjectId">ID ou URL do Projeto no Asana</Label>
                      <Input
                        id="asanaProjectId"
                        placeholder="Cole a URL completa do projeto ou apenas o ID numérico"
                        value={asanaProjectId}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          // Tentar extrair ID da URL se for uma URL completa
                          const urlMatch = value.match(/\/projects\/(\d+)/);
                          if (urlMatch) {
                            setAsanaProjectId(urlMatch[1]);
                          } else {
                            setAsanaProjectId(value);
                          }
                        }}
                      />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Como encontrar o ID:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Acesse seu projeto no Asana</li>
                          <li>Na URL do projeto, procure por algo como: <code className="bg-gray-100 px-1 rounded">asana.com/0/projects/1234567890/list</code></li>
                          <li>Copie apenas os números após "/projects/" (ex: 1234567890)</li>
                          <li>Ou cole a URL completa que extrairemos o ID automaticamente</li>
                        </ol>
                        <p className="text-amber-600"><strong>⚠️ Não use URLs de OAuth ou autorização!</strong></p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAsanaSync}
                        disabled={!asanaToken || !asanaProjectId || isSyncing}
                        className="flex-1"
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open('https://asana.com', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => setShowNewActivity(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Atividade
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por Macro Etapa</label>
              <Select value={filters.macroEtapa} onValueChange={(value) => setFilters(prev => ({ ...prev, macroEtapa: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as macro etapas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as macro etapas</SelectItem>
                  {uniqueMacroEtapas.map((macro) => (
                    <SelectItem key={macro} value={macro}>{macro}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por Etapa</label>
              <Select value={filters.etapa} onValueChange={(value) => setFilters(prev => ({ ...prev, etapa: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as etapas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as etapas</SelectItem>
                  {uniqueEtapas.map((etapa) => (
                    <SelectItem key={etapa} value={etapa}>{etapa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {uniqueStatus.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nova Atividade */}
          {showNewActivity && (
            <div className="mb-6 p-4 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-semibold mb-4">Adicionar Nova Atividade</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Input
                  placeholder="Código"
                  value={newActivity.codigo || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, codigo: e.target.value }))}
                />
                <Input
                  placeholder="Macro Etapa"
                  value={newActivity.macroEtapa || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, macroEtapa: e.target.value }))}
                />
                <Input
                  placeholder="Etapa"
                  value={newActivity.etapa || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, etapa: e.target.value }))}
                />
                <Input
                  placeholder="Responsável"
                  value={newActivity.responsavel || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, responsavel: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Início Planejado"
                  value={newActivity.dataInicioPlanned || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, dataInicioPlanned: e.target.value }))}
                />
                <Input
                  type="date"
                  placeholder="Fim Planejado"
                  value={newActivity.dataFimPlanned || ''}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, dataFimPlanned: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddActivity}>Adicionar</Button>
                <Button variant="outline" onClick={() => setShowNewActivity(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Código</th>
                  <th className="border border-gray-300 p-2 text-left">Macro Etapa</th>
                  <th className="border border-gray-300 p-2 text-left">Etapa</th>
                  <th className="border border-gray-300 p-2 text-left">Responsável</th>
                  <th className="border border-gray-300 p-2 text-left">Início Plan.</th>
                  <th className="border border-gray-300 p-2 text-left">Fim Plan.</th>
                  <th className="border border-gray-300 p-2 text-left">Início Replan.</th>
                  <th className="border border-gray-300 p-2 text-left">Fim Replan.</th>
                  <th className="border border-gray-300 p-2 text-left">Início Real</th>
                  <th className="border border-gray-300 p-2 text-left">Fim Real</th>
                  <th className="border border-gray-300 p-2 text-left">Status</th>
                  <th className="border border-gray-300 p-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    {editingId === activity.id && editingActivity ? (
                      <>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={editingActivity.codigo}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, codigo: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={editingActivity.macroEtapa}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, macroEtapa: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={editingActivity.etapa}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, etapa: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={editingActivity.responsavel}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, responsavel: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="date"
                            value={editingActivity.dataInicioPlanned}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, dataInicioPlanned: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="date"
                            value={editingActivity.dataFimPlanned}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, dataFimPlanned: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="date"
                            value={editingActivity.dataInicioReplanned}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, dataInicioReplanned: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="date"
                            value={editingActivity.dataFimReplanned}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, dataFimReplanned: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="date"
                            value={editingActivity.dataInicioReal}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, dataInicioReal: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            type="date"
                            value={editingActivity.dataFimReal}
                            onChange={(e) => setEditingActivity(prev => prev ? { ...prev, dataFimReal: e.target.value } : null)}
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          {getStatusBadge(calculateStatus(editingActivity))}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleSave}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-300 p-2 font-medium">{activity.codigo}</td>
                        <td className="border border-gray-300 p-2">{activity.macroEtapa}</td>
                        <td className="border border-gray-300 p-2">{activity.etapa}</td>
                        <td className="border border-gray-300 p-2">{activity.responsavel}</td>
                        <td className="border border-gray-300 p-2">{activity.dataInicioPlanned || '-'}</td>
                        <td className="border border-gray-300 p-2">{activity.dataFimPlanned || '-'}</td>
                        <td className="border border-gray-300 p-2">{activity.dataInicioReplanned || '-'}</td>
                        <td className="border border-gray-300 p-2">{activity.dataFimReplanned || '-'}</td>
                        <td className="border border-gray-300 p-2">{activity.dataInicioReal || '-'}</td>
                        <td className="border border-gray-300 p-2">{activity.dataFimReal || '-'}</td>
                        <td className="border border-gray-300 p-2">
                          {getStatusBadge(calculateStatus(activity))}
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(activity)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma atividade encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSchedule;
