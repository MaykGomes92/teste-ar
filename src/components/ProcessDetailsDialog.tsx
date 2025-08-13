import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, Shield, TrendingUp, Activity, Upload, FileText, Download, Eye, Target, CheckCircle, History, ArrowRight, CheckSquare, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProcessDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  process: any;
}

const ProcessDetailsDialog = ({ isOpen, onClose, process }: ProcessDetailsDialogProps) => {
  const [risks, setRisks] = useState([]);
  const [controls, setControls] = useState([]);
  const [kris, setKris] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [tests, setTests] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);
  const [bpmnFile, setBpmnFile] = useState<File | null>(null);
  const [raciFile, setRaciFile] = useState<File | null>(null);
  const [descritivoFile, setDescritivoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Status hierarchy definition
  const validationSteps = [
    { value: 0, label: "Não Iniciado", color: "bg-gray-100 text-gray-800" },
    { value: 1, label: "Em desenvolvimento", color: "bg-blue-100 text-blue-800" },
    { value: 2, label: "Em revisão", color: "bg-yellow-100 text-yellow-800" },
    { value: 3, label: "Aprovação QA CI", color: "bg-orange-100 text-orange-800" },
    { value: 4, label: "Aprovação Cliente", color: "bg-purple-100 text-purple-800" },
    { value: 5, label: "Aprovação CI", color: "bg-green-100 text-green-800" },
    { value: 6, label: "Concluído", color: "bg-emerald-100 text-emerald-800" }
  ];

  const getValidationStepLabel = (step: number) => {
    const stepData = validationSteps.find(s => s.value === step);
    return stepData ? stepData.label : "Não Iniciado";
  };

  const getValidationStepColor = (step: number) => {
    const stepData = validationSteps.find(s => s.value === step);
    return stepData ? stepData.color : "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'em andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluído':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevel = (probability: number, impact: number): number => {
    return probability * impact;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto':
        return 'bg-red-100 text-red-800';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Data fetching
  const fetchProcessData = async () => {
    if (!process?.id) return;

    try {
      const [risksRes, controlsRes, krisRes, improvementsRes, testsRes] = await Promise.all([
        supabase.from('riscos').select('*').eq('processo_id', process.id),
        supabase.from('kris').select('*').eq('processo_id', process.id),
        supabase.from('kris').select('*').eq('processo_id', process.id),
        supabase.from('melhorias').select('*').eq('processo_id', process.id),
        supabase.from('audit_tests').select('*').eq('processo_id', process.id)
      ]);

      if (risksRes.data) setRisks(risksRes.data);
      if (controlsRes.data) setControls(controlsRes.data);
      if (krisRes.data) setKris(krisRes.data);
      if (improvementsRes.data) setImprovements(improvementsRes.data);
      if (testsRes.data) setTests(testsRes.data);

      // Fetch comprehensive status logs including user names
      await fetchStatusLogs();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do processo",
        variant: "destructive",
      });
    }
  };

  // Enhanced status logs fetch with user names and all change types
  const fetchStatusLogs = async () => {
    if (!process?.id) return;

    try {
      // Get status change logs
      const { data: processStatusLogs } = await supabase
        .from('process_status_logs')
        .select('*')
        .eq('processo_id', process.id)
        .order('created_at', { ascending: false });

      // Create comprehensive log entries
      const allLogs = [];

      // Add status change logs with user names
      if (processStatusLogs) {
        for (const log of processStatusLogs) {
          let userName = 'Sistema';
          if (log.created_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('nome')
              .eq('id', log.created_by)
              .single();
            userName = profile?.nome || 'Usuário';
          }
          allLogs.push({
            id: `status-${log.id}`,
            tipo: 'status_change',
            acao: `Status alterado: ${getValidationStepLabel(log.status_anterior || 0)} → ${getValidationStepLabel(log.status_novo)}`,
            observacoes: log.observacoes,
            usuario: userName,
            created_at: log.created_at
          });
        }
      }

      // Add attachment logs
      if (process.attachment_names && process.attachment_dates) {
        process.attachment_names.forEach((name: string, index: number) => {
          allLogs.push({
            id: `attachment-fluxograma-${index}`,
            tipo: 'attachment',
            acao: 'Fluxograma anexado',
            observacoes: `Arquivo: ${name}`,
            usuario: 'Sistema', // You might want to store who uploaded each file
            created_at: process.attachment_dates[index] || new Date().toISOString()
          });
        });
      }

      if (process.raci_attachment_names && process.raci_attachment_dates) {
        process.raci_attachment_names.forEach((name: string, index: number) => {
          allLogs.push({
            id: `attachment-raci-${index}`,
            tipo: 'attachment',
            acao: 'Matriz RACI anexada',
            observacoes: `Arquivo: ${name}`,
            usuario: 'Sistema',
            created_at: process.raci_attachment_dates[index] || new Date().toISOString()
          });
        });
      }

      if (process.descritivo_attachment_names && process.descritivo_attachment_dates) {
        process.descritivo_attachment_names.forEach((name: string, index: number) => {
          allLogs.push({
            id: `attachment-descritivo-${index}`,
            tipo: 'attachment',
            acao: 'Descritivo de Processos anexado',
            observacoes: `Arquivo: ${name}`,
            usuario: 'Sistema',
            created_at: process.descritivo_attachment_dates[index] || new Date().toISOString()
          });
        });
      }

      // Sort all logs by date (most recent first)
      allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setStatusLogs(allLogs);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  // Function to log actions with user information
  const logAction = async (action: string, details?: string, type: string = 'action') => {
    if (!process?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single();

      // Add to local logs immediately for better UX
      const newLog = {
        id: `local-${Date.now()}`,
        tipo: type,
        acao: action,
        observacoes: details,
        usuario: profile?.nome || user.email || 'Usuário',
        created_at: new Date().toISOString()
      };

      setStatusLogs(prev => [newLog, ...prev]);

      // You could also save this to a custom logs table if needed
      // For now, the system will rely on triggers for automatic logging
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  };

  useEffect(() => {
    if (isOpen && process) {
      fetchProcessData();
    }
  }, [isOpen, process]);

  // Calculate statistics
  const riskStats = {
    total: risks.length,
    high: risks.filter(r => getRiskLevel(r.probabilidade, r.nivel_impacto) >= 15).length,
    medium: risks.filter(r => {
      const level = getRiskLevel(r.probabilidade, r.nivel_impacto);
      return level >= 10 && level < 15;
    }).length,
    low: risks.filter(r => getRiskLevel(r.probabilidade, r.nivel_impacto) < 10).length
  };

  const controlStats = {
    total: controls.length,
    active: controls.filter(c => c.status === 'Ativo').length,
    inactive: controls.filter(c => c.status !== 'Ativo').length
  };

  const improvementStats = {
    total: improvements.length,
    completed: improvements.filter(i => i.status === 'Concluído').length,
    inProgress: improvements.filter(i => i.status === 'Em andamento').length
  };

  const testStats = {
    total: tests.length,
    passed: tests.filter(t => (t.maturidade + t.mitigacao) >= 4).length,
    failed: tests.filter(t => (t.maturidade + t.mitigacao) < 4).length
  };

  // File upload handlers
  const handleBpmnUpload = async () => {
    if (!bpmnFile || !process) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const sanitizedName = bpmnFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');
      
      const fileName = `${user.id}/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('bpmn-diagrams')
        .upload(fileName, bpmnFile);
      
      if (uploadError) throw uploadError;

      const currentNames = process.attachment_names || [];
      const currentPaths = process.attachment_paths || [];
      const currentDates = process.attachment_dates || [];

      const updatedNames = [...currentNames, bpmnFile.name];
      const updatedPaths = [...currentPaths, fileName];
      const updatedDates = [...currentDates, new Date().toISOString()];

      const { error: updateError } = await supabase
        .from('processos')
        .update({
          attachment_names: updatedNames,
          attachment_paths: updatedPaths,
          attachment_dates: updatedDates
        })
        .eq('id', process.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Fluxograma enviado com sucesso!",
      });

      // Log the upload action
      await logAction(
        "Fluxograma anexado",
        `Arquivo: ${bpmnFile.name}`,
        "attachment"
      );

      setBpmnFile(null);
      fetchProcessData();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRaciUpload = async () => {
    if (!raciFile || !process) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const sanitizedName = raciFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');
      
      const fileName = `${user.id}/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('bpmn-diagrams')
        .upload(fileName, raciFile);
      
      if (uploadError) throw uploadError;

      const currentNames = process.raci_attachment_names || [];
      const currentPaths = process.raci_attachment_paths || [];
      const currentDates = process.raci_attachment_dates || [];

      const updatedNames = [...currentNames, raciFile.name];
      const updatedPaths = [...currentPaths, fileName];
      const updatedDates = [...currentDates, new Date().toISOString()];

      const { error: updateError } = await supabase
        .from('processos')
        .update({
          raci_attachment_names: updatedNames,
          raci_attachment_paths: updatedPaths,
          raci_attachment_dates: updatedDates
        })
        .eq('id', process.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Matriz RACI enviada com sucesso!",
      });

      // Log the upload action
      await logAction(
        "Matriz RACI anexada",
        `Arquivo: ${raciFile.name}`,
        "attachment"
      );

      setRaciFile(null);
      fetchProcessData();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescritivoUpload = async () => {
    if (!descritivoFile || !process) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const sanitizedName = descritivoFile.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');
      
      const fileName = `${user.id}/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('bpmn-diagrams')
        .upload(fileName, descritivoFile);
      
      if (uploadError) throw uploadError;

      const currentNames = process.descritivo_attachment_names || [];
      const currentPaths = process.descritivo_attachment_paths || [];
      const currentDates = process.descritivo_attachment_dates || [];

      const updatedNames = [...currentNames, descritivoFile.name];
      const updatedPaths = [...currentPaths, fileName];
      const updatedDates = [...currentDates, new Date().toISOString()];

      const { error: updateError } = await supabase
        .from('processos')
        .update({
          descritivo_attachment_names: updatedNames,
          descritivo_attachment_paths: updatedPaths,
          descritivo_attachment_dates: updatedDates
        })
        .eq('id', process.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Descritivo de Processos enviado com sucesso!",
      });

      // Log the upload action
      await logAction(
        "Descritivo de Processos anexado",
        `Arquivo: ${descritivoFile.name}`,
        "attachment"
      );

      setDescritivoFile(null);
      fetchProcessData();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (path: string, name: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('bpmn-diagrams')
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive",
      });
    }
  };

  const deleteAttachment = async (type: 'fluxograma' | 'raci' | 'descritivo', index: number) => {
    if (!process) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let names, paths, dates, updateField;
      
      if (type === 'fluxograma') {
        names = [...(process.attachment_names || [])];
        paths = [...(process.attachment_paths || [])];
        dates = [...(process.attachment_dates || [])];
        updateField = {
          attachment_names: names,
          attachment_paths: paths,
          attachment_dates: dates
        };
      } else if (type === 'raci') {
        names = [...(process.raci_attachment_names || [])];
        paths = [...(process.raci_attachment_paths || [])];
        dates = [...(process.raci_attachment_dates || [])];
        updateField = {
          raci_attachment_names: names,
          raci_attachment_paths: paths,
          raci_attachment_dates: dates
        };
      } else {
        names = [...(process.descritivo_attachment_names || [])];
        paths = [...(process.descritivo_attachment_paths || [])];
        dates = [...(process.descritivo_attachment_dates || [])];
        updateField = {
          descritivo_attachment_names: names,
          descritivo_attachment_paths: paths,
          descritivo_attachment_dates: dates
        };
      }

      // Remove do storage
      const pathToDelete = paths[index];
      if (pathToDelete) {
        await supabase.storage
          .from('bpmn-diagrams')
          .remove([pathToDelete]);
      }

      // Remove dos arrays
      names.splice(index, 1);
      paths.splice(index, 1);
      dates.splice(index, 1);

      // Atualiza no banco
      const { error: updateError } = await supabase
        .from('processos')
        .update(updateField)
        .eq('id', process.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso!",
      });

      // Log the deletion action
      const fileName = type === 'fluxograma' ? process.attachment_names[index] :
                      type === 'raci' ? process.raci_attachment_names[index] :
                      process.descritivo_attachment_names[index];
      
      await logAction(
        `Arquivo ${type} removido`,
        `Arquivo removido: ${fileName}`,
        "deletion"
      );

      fetchProcessData();
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o arquivo",
        variant: "destructive",
      });
    }
  };

  if (!process) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold text-orla-green-dark">
            Detalhes do Processo: {process.nome}
          </DialogTitle>
          <DialogDescription className="text-orla-green">
            Informações completas e análise executiva do processo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Executive Summary */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-orla-green-dark" />
              <h2 className="text-lg font-semibold text-orla-green-dark">Executive Summary</h2>
            </div>

            {/* Box Unificado: Estrutura da Cadeia de Valor e Descrição */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-orla-green-dark">
                  <Shield className="w-5 h-5" />
                  Estrutura da Cadeia de Valor e Descrição
                </CardTitle>
                <CardDescription className="text-orla-green">
                  Posicionamento estratégico e detalhamento funcional do processo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Estrutura da Cadeia de Valor */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-orla-green-dark border-b border-orla-green/20 pb-1">
                      Estrutura da Cadeia de Valor
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Macro Processo:</label>
                        <p className="text-sm font-semibold text-slate-800 mt-1">{process.macro_processo || "Não definido"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">ID Macro Processo:</label>
                        <p className="text-sm font-semibold text-slate-800 mt-1">{process.macro_processo_id || "Não definido"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição do Processo */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-orla-green-dark border-b border-orla-green/20 pb-1">
                      Descrição do Processo
                    </h4>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Descrição:</label>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                        {process.descricao || "Descrição não disponível"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Box Unificado: Informações Gerais e Status de Validação */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-orla-green-dark">
                  <CheckCircle className="w-5 h-5" />
                  Informações Gerais e Status de Validação
                </CardTitle>
                <CardDescription className="text-orla-green">
                  Dados operacionais e estágio atual de aprovação
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Responsável:</label>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{process.responsavel || "Não atribuído"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Status:</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(process.status)}>
                        {process.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Etapa de Validação:</label>
                    <div className="mt-1">
                      <Badge className={getValidationStepColor(process.validacao_etapa || 0)}>
                        {getValidationStepLabel(process.validacao_etapa || 0)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">RACI:</label>
                    <div className="mt-1">
                      <Badge className={process.raci_validacao === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {process.raci_validacao === 'aprovado' ? 'Aprovado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Descritivo:</label>
                    <div className="mt-1">
                      <Badge className={process.descritivo_validacao === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {process.descritivo_validacao === 'aprovado' ? 'Aprovado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Fluxograma:</label>
                    <div className="mt-1">
                      <Badge className={process.fluxograma_validacao === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {process.fluxograma_validacao === 'aprovado' ? 'Aprovado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Box Resumo Executivo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Card Riscos */}
              <Card className="border-2 border-orla-green/30 bg-orla-green/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                    <AlertTriangle className="w-4 h-4" />
                    Riscos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orla-green-dark">{riskStats.total}</div>
                  <p className="text-xs text-muted-foreground">{riskStats.high} críticos</p>
                </CardContent>
              </Card>

              {/* Card Controles */}
              <Card className="border-2 border-orla-green/30 bg-orla-green/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                    <Shield className="w-4 h-4" />
                    Controles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orla-green-dark">{controlStats.total}</div>
                  <p className="text-xs text-muted-foreground">{controlStats.active} ativos</p>
                </CardContent>
              </Card>

              {/* Card Melhorias */}
              <Card className="border-2 border-orla-green/30 bg-orla-green/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                    <TrendingUp className="w-4 h-4" />
                    Melhorias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orla-green-dark">{improvementStats.total}</div>
                  <p className="text-xs text-muted-foreground">{improvementStats.completed} concluídas</p>
                </CardContent>
              </Card>

              {/* Card Testes */}
              <Card className="border-2 border-orla-green/30 bg-orla-green/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                    <CheckCircle className="w-4 h-4" />
                    Teste de Desenho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orla-green-dark">{testStats.total}</div>
                  <p className="text-xs text-muted-foreground">{testStats.passed} aprovados</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Principais Boxes: Riscos vs Controles, KRI e Teste de Efetividade */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Box Unificado: Principais Riscos vs Controles Implementados */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-orla-green-dark">
                  <Shield className="w-5 h-5" />
                  Riscos vs Controles
                </CardTitle>
                <CardDescription className="text-orla-green">
                  Mapeamento dos principais riscos e controles
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {risks.length > 0 ? (
                    risks.slice(0, 3).map((risk: any) => {
                      const relatedControls = controls.filter((control: any) => control.risco_id === risk.id);
                      const riskLevel = getRiskLevel(risk.probabilidade, risk.nivel_impacto);
                      const levelText = riskLevel >= 15 ? "Alto" : riskLevel >= 10 ? "Médio" : "Baixo";
                      
                      return (
                        <div key={risk.id} className="border border-orla-green/20 rounded-lg p-3 bg-white/50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-3 h-3 text-orange-600" />
                                <h4 className="font-semibold text-xs text-slate-800 line-clamp-1">{risk.nome}</h4>
                                <Badge className={`${getRiskColor(levelText)} text-xs`}>
                                  {levelText}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>P: {risk.probabilidade}/5</span>
                                <span>I: {risk.nivel_impacto}/5</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t border-orla-green/10 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-orla-green-dark">
                                {relatedControls.length} controle(s)
                              </span>
                              {relatedControls.length > 0 && (
                                <div className="flex gap-1">
                                  {relatedControls.slice(0, 2).map((control: any) => (
                                    <Badge key={control.id} variant="outline" className="text-xs">
                                      {control.status}
                                    </Badge>
                                  ))}
                                  {relatedControls.length > 2 && (
                                    <span className="text-xs text-slate-500">+{relatedControls.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {relatedControls.length === 0 && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs text-yellow-800">Sem controles</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Nenhum risco registrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card KRI */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-orla-green-dark">
                  <Target className="w-5 h-5" />
                  Key Risk Indicators (KRI)
                </CardTitle>
                <CardDescription className="text-orla-green">
                  Monitoramento de indicadores de risco
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded border border-orla-green/10">
                      <div className="text-xl font-bold text-orla-green-dark">{controlStats.total}</div>
                      <div className="text-xs text-slate-600">Total KRIs</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded border border-orla-green/10">
                      <div className="text-xl font-bold text-green-600">{controlStats.active}</div>
                      <div className="text-xs text-slate-600">Ativos</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Status Monitoramento:</span>
                      <Badge className="bg-blue-100 text-blue-800">Ativo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Frequência:</span>
                      <span className="text-sm text-orla-green-dark">Mensal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Última Atualização:</span>
                      <span className="text-sm text-slate-500">
                        {new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-orla-green text-orla-green-dark hover:bg-orla-green/10"
                    onClick={() => {
                      console.log('Navegar para KRI Management');
                    }}
                  >
                    Ver Detalhes KRI
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card Teste de Efetividade */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-orla-green-dark">
                  <CheckCircle className="w-5 h-5" />
                  Teste de Efetividade
                </CardTitle>
                <CardDescription className="text-orla-green">
                  Avaliação da efetividade dos controles
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded border border-orla-green/10">
                      <div className="text-xl font-bold text-orla-green-dark">{testStats.total}</div>
                      <div className="text-xs text-slate-600">Total Testes</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded border border-orla-green/10">
                      <div className="text-xl font-bold text-green-600">{testStats.passed}</div>
                      <div className="text-xs text-slate-600">Efetivos</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Taxa de Efetividade:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {testStats.total > 0 ? Math.round((testStats.passed / testStats.total) * 100) : 0}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Último Teste:</span>
                      <span className="text-sm text-slate-500">
                        {new Date().toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Próximo Teste:</span>
                      <span className="text-sm text-orla-green-dark">Planejado</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-orla-green text-orla-green-dark hover:bg-orla-green/10"
                    onClick={() => {
                      console.log('Navegar para Testes de Efetividade');
                    }}
                  >
                    Ver Testes de Efetividade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Upload de Documentos - Fluxograma, RACI e Descritivo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Upload Fluxograma */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                  <FileText className="w-4 h-4" />
                  Fluxograma
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Arquivo atual */}
                  {process.attachment_names && process.attachment_names.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {process.attachment_names.map((name: string, index: number) => (
                         <div key={index} className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <FileText className="w-4 h-4 text-blue-600" />
                               <span className="text-sm font-medium text-blue-800 truncate">
                                 {name}
                               </span>
                             </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadAttachment(process.attachment_paths[index], name)}
                                  className="h-6 px-2 border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteAttachment('fluxograma', index)}
                                  className="h-6 px-2 border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                           </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Anexado em: {process.attachment_dates?.[index] 
                              ? new Date(process.attachment_dates[index]).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Data não disponível'
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 border-2 border-dashed border-blue-300 rounded-lg text-center">
                      <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-xs text-blue-600">Nenhum fluxograma anexado</p>
                    </div>
                  )}
                  
                  {/* Upload novo arquivo */}
                  <div className="text-center">
                    <Input
                      type="file"
                      accept=".bpmn,.xml,.png,.jpg,.jpeg,.pdf"
                      onChange={(e) => setBpmnFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="fluxograma-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('fluxograma-upload')?.click()}
                      className="w-full text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {bpmnFile ? 'Trocar Arquivo' : 'Nova Versão'}
                    </Button>
                    {bpmnFile && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-600 mb-2">{bpmnFile.name}</p>
                        <Button
                          onClick={handleBpmnUpload}
                          disabled={loading}
                          size="sm"
                          className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload RACI */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                  <FileText className="w-4 h-4" />
                  Matriz RACI
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status de validação */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700">Status:</span>
                    <Badge 
                      className={
                        process.raci_validacao === 'aprovado' ? 'bg-green-100 text-green-800' :
                        process.raci_validacao === 'revisao' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {process.raci_validacao === 'aprovado' ? 'Aprovado' :
                       process.raci_validacao === 'revisao' ? 'Em Revisão' :
                       'Pendente'}
                    </Badge>
                  </div>
                  
                  {/* Validação info */}
                  {process.raci_validado_em && (
                    <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                      <p className="text-xs text-green-700">
                        Validado em: {new Date(process.raci_validado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  
                  {/* Lista de arquivos RACI */}
                  {process.raci_attachment_names && process.raci_attachment_names.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {process.raci_attachment_names.map((name: string, index: number) => (
                         <div key={index} className="p-2 bg-green-100 border border-green-200 rounded">
                           <div className="flex items-center justify-between">
                             <span className="text-xs font-medium text-green-800 truncate">{name}</span>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadAttachment(process.raci_attachment_paths[index], name)}
                                  className="h-6 px-2 border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteAttachment('raci', index)}
                                  className="h-6 px-2 border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                           </div>
                         </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload novo arquivo RACI */}
                  <div className="text-center">
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf"
                      onChange={(e) => setRaciFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="raci-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('raci-upload')?.click()}
                      className="w-full text-xs border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {raciFile ? 'Trocar Arquivo' : 'Nova Versão'}
                    </Button>
                    {raciFile && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600 mb-2">{raciFile.name}</p>
                        <Button
                          onClick={handleRaciUpload}
                          disabled={loading}
                          size="sm"
                          className="w-full text-xs bg-green-600 hover:bg-green-700"
                        >
                          {loading ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Descritivo */}
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orla-green-dark">
                  <FileText className="w-4 h-4" />
                  Descritivo de Processos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Status de validação */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-700">Status:</span>
                    <Badge 
                      className={
                        process.descritivo_validacao === 'aprovado' ? 'bg-green-100 text-green-800' :
                        process.descritivo_validacao === 'revisao' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {process.descritivo_validacao === 'aprovado' ? 'Aprovado' :
                       process.descritivo_validacao === 'revisao' ? 'Em Revisão' :
                       'Pendente'}
                    </Badge>
                  </div>
                  
                  {/* Lista de arquivos descritivos */}
                  {process.descritivo_attachment_names && process.descritivo_attachment_names.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {process.descritivo_attachment_names.map((name: string, index: number) => (
                         <div key={index} className="p-2 bg-purple-100 border border-purple-200 rounded">
                           <div className="flex items-center justify-between">
                             <span className="text-xs font-medium text-purple-800 truncate">{name}</span>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadAttachment(process.descritivo_attachment_paths[index], name)}
                                  className="h-6 px-2 border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteAttachment('descritivo', index)}
                                  className="h-6 px-2 border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                           </div>
                         </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload novo arquivo descritivo */}
                  <div className="text-center">
                    <Input
                      type="file"
                      accept=".doc,.docx,.pdf,.txt"
                      onChange={(e) => setDescritivoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="descritivo-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('descritivo-upload')?.click()}
                      className="w-full text-xs border-purple-300 text-purple-700 hover:bg-purple-100"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      {descritivoFile ? 'Trocar Arquivo' : 'Nova Versão'}
                    </Button>
                    {descritivoFile && (
                      <div className="mt-2">
                        <p className="text-xs text-purple-600 mb-2">{descritivoFile.name}</p>
                        <Button
                          onClick={handleDescritivoUpload}
                          disabled={loading}
                          size="sm"
                          className="w-full text-xs bg-purple-600 hover:bg-purple-700"
                        >
                          {loading ? "Enviando..." : "Enviar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Log de Status - Movido para o final */}
          {statusLogs.length > 0 && (
            <Card className="border-2 border-orla-green/30 bg-orla-green/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-orla-green-dark">
                  <History className="w-5 h-5" />
                  Histórico de Validação
                </CardTitle>
                <CardDescription className="text-orla-green">
                  Timeline das aprovações e mudanças de status
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {statusLogs.map((log: any) => {
                    // Get icon based on log type
                    const getLogIcon = (tipo: string) => {
                      switch (tipo) {
                        case 'status_change':
                          return <CheckCircle className="w-4 h-4 text-blue-600" />;
                        case 'attachment':
                          return <Upload className="w-4 h-4 text-green-600" />;
                        case 'deletion':
                          return <X className="w-4 h-4 text-red-600" />;
                        default:
                          return <Activity className="w-4 h-4 text-orla-green-dark" />;
                      }
                    };

                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-white/50 rounded border border-orla-green/20">
                        <div className="flex-shrink-0 mt-1">
                          {getLogIcon(log.tipo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-orla-green-dark">{log.acao}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(log.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {log.observacoes && (
                            <p className="text-sm text-slate-600 mt-1">{log.observacoes}</p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs font-medium text-orla-green-dark">
                              Por: {log.usuario}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {log.tipo === 'status_change' ? 'Status' : 
                               log.tipo === 'attachment' ? 'Anexo' :
                               log.tipo === 'deletion' ? 'Remoção' : 'Sistema'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessDetailsDialog;