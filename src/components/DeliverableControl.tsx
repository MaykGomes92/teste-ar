import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, AlertTriangle, CheckCircle, ExternalLink, Eye, GitBranch, Target, FileText, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { differenceInDays } from "date-fns";
import { DeliverableApprovalModal } from "./DeliverableApprovalModal";

interface Deliverable {
  id: string;
  type: 'processo' | 'dados' | 'risco' | 'controle' | 'teste' | 'raci' | 'descritivo';
  codigo: string;
  nome: string;
  macroProcesso: string;
  processo: string;
  processId: string;
  risco?: string;
  riscoId?: string;
  controle?: string;
  controleId?: string;
  responsavel?: string;
  validacao_etapa: number;
  status: string;
  created_at: string;
  updated_at: string;
  diasComResponsavel?: number;
}

interface DeliverableControlProps {
  onProcessClick?: (processId: string) => void;
  onScheduleClick?: () => void;
}

const DeliverableControl = ({ onProcessClick, onScheduleClick }: DeliverableControlProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMacroProcess, setSelectedMacroProcess] = useState("all");
  const [selectedProcess, setSelectedProcess] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [macroProcessOptions, setMacroProcessOptions] = useState<{value: string, label: string}[]>([]);
  const [processOptions, setProcessOptions] = useState<{value: string, label: string}[]>([]);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedProcessForApproval, setSelectedProcessForApproval] = useState<{
    id: string;
    name: string;
    deliverables: Deliverable[];
  } | null>(null);
  const { toast } = useToast();

  const statusOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "0", label: "Não Iniciado" },
    { value: "1", label: "Em desenvolvimento" },
    { value: "2", label: "Em revisão" },
    { value: "3", label: "Aprovação QA CI" },
    { value: "4", label: "Aprovação Cliente" },
    { value: "5", label: "Aprovação CI" },
    { value: "6", label: "Concluído" },
  ];

  const typeOptions = [
    { value: "all", label: "Todos os Tipos" },
    { value: "processo", label: "Processos" },
    { value: "raci", label: "RACI" },
    { value: "descritivo", label: "Descritivo" },
    { value: "dados", label: "Dados/Planilhas" },
    { value: "risco", label: "Riscos" },
    { value: "controle", label: "Controles" },
    { value: "teste", label: "Testes" },
  ];

  useEffect(() => {
    fetchDeliverables();
  }, []);

  // Atualizar opções de processos quando macro processo muda
  useEffect(() => {
    updateProcessOptions();
  }, [selectedMacroProcess, deliverables]);

  // Debounce search to reduce API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Search logic is handled in useMemo, no API call needed
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const updateProcessOptions = () => {
    if (selectedMacroProcess === "all") {
      // Mostrar todos os processos
      const processosList = [...new Set(deliverables.map(d => d.processo))];
      setProcessOptions([
        { value: "all", label: "Todos os Processos" },
        ...processosList.map(p => ({ value: p, label: p }))
      ]);
    } else {
      // Filtrar processos pelo macro processo selecionado
      const processosDoMacro = [...new Set(
        deliverables
          .filter(d => d.macroProcesso === selectedMacroProcess)
          .map(d => d.processo)
      )];
      setProcessOptions([
        { value: "all", label: "Todos os Processos" },
        ...processosDoMacro.map(p => ({ value: p, label: p }))
      ]);
    }
    
    // Reset processo selecionado quando macro processo muda
    setSelectedProcess("all");
  };

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel with retry logic
      const fetchWithRetry = async (query: any, retries = 2) => {
        for (let i = 0; i <= retries; i++) {
          try {
            const result = await query;
            if (result.error) throw result.error;
            return result;
          } catch (error) {
            if (i === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      const [processosResult, dadosResult, riscosResult, controlesResult, testesResult] = await Promise.allSettled([
        fetchWithRetry(supabase.from('processos').select(`
          *,
          raci_validacao,
          raci_validado_por,
          raci_validado_em,
          descritivo_validacao,
          descritivo_validado_por,
          descritivo_validado_em
        `).order('nome')),
        fetchWithRetry(supabase.from('dados_planilhas').select('*').order('nome_planilha')),
        fetchWithRetry(supabase.from('riscos').select(`
          *,
          processos:processo_id (
            id,
            nome,
            macro_processo
          )
        `).order('nome')),
        fetchWithRetry(supabase.from('kris').select(`
          *,
          riscos:risco_id (
            id,
            nome,
            codigo,
            processos:processo_id (
              id,
              nome,
              macro_processo
            )
          )
        `).order('nome')),
        fetchWithRetry(supabase.from('testes').select(`
          *,
          kris:controle_id (
            id,
            nome,
            codigo,
            riscos:risco_id (
              id,
              nome,
              codigo,
              processos:processo_id (
                id,
                nome,
                macro_processo
              )
            )
          )
        `).order('nome'))
      ]);

      const processos = processosResult.status === 'fulfilled' ? processosResult.value.data : [];
      const dados = dadosResult.status === 'fulfilled' ? dadosResult.value.data : [];
      const riscos = riscosResult.status === 'fulfilled' ? riscosResult.value.data : [];
      const controles = controlesResult.status === 'fulfilled' ? controlesResult.value.data : [];
      const testes = testesResult.status === 'fulfilled' ? testesResult.value.data : [];

      // Transformar dados em entregáveis
      const allDeliverables: Deliverable[] = [
        // Processos (Fluxograma)
        ...(processos || []).map(processo => ({
          id: processo.id,
          type: 'processo' as const,
          codigo: processo.codigo || `PR.${processo.id.substring(0,8)}`,
          nome: processo.nome,
          macroProcesso: `${processo.macro_processo_id} - ${processo.macro_processo}`,
          processo: processo.nome,
          processId: processo.id,
          responsavel: processo.responsavel,
          validacao_etapa: processo.validacao_etapa || 0,
          status: processo.status,
          created_at: processo.created_at,
          updated_at: processo.updated_at,
          diasComResponsavel: processo.updated_at ? differenceInDays(new Date(), new Date(processo.updated_at)) : 0
        })),

        // RACI (baseado nos processos)
        ...(processos || []).map(processo => ({
          id: `${processo.id}-raci`,
          type: 'raci' as const,
          codigo: `RACI.${processo.id.substring(0,8)}`,
          nome: `RACI - ${processo.nome}`,
          macroProcesso: `${processo.macro_processo_id} - ${processo.macro_processo}`,
          processo: processo.nome,
          processId: processo.id,
          responsavel: processo.responsavel,
          validacao_etapa: processo.raci_validacao === 'aprovado' ? 4 : 
                          processo.raci_validacao === 'revisao' ? 2 : 
                          processo.raci_validacao === 'pendente' ? 0 : 0,
          status: processo.raci_validacao || 'pendente',
          created_at: processo.created_at,
          updated_at: processo.raci_validado_em || processo.updated_at,
          diasComResponsavel: (processo.raci_validado_em || processo.updated_at) ? 
            differenceInDays(new Date(), new Date(processo.raci_validado_em || processo.updated_at)) : 0
        })),

        // Descritivo (baseado nos processos)
        ...(processos || []).map(processo => ({
          id: `${processo.id}-descritivo`,
          type: 'descritivo' as const,
          codigo: `DESC.${processo.id.substring(0,8)}`,
          nome: `Descritivo - ${processo.nome}`,
          macroProcesso: `${processo.macro_processo_id} - ${processo.macro_processo}`,
          processo: processo.nome,
          processId: processo.id,
          responsavel: processo.responsavel,
          validacao_etapa: processo.descritivo_validacao === 'aprovado' ? 4 : 
                          processo.descritivo_validacao === 'revisao' ? 2 : 
                          processo.descritivo_validacao === 'pendente' ? 0 : 0,
          status: processo.descritivo_validacao || 'pendente',
          created_at: processo.created_at,
          updated_at: processo.descritivo_validado_em || processo.updated_at,
          diasComResponsavel: (processo.descritivo_validado_em || processo.updated_at) ? 
            differenceInDays(new Date(), new Date(processo.descritivo_validado_em || processo.updated_at)) : 0
        })),
        
        // Dados/Planilhas
        ...(dados || []).map(dado => ({
          id: dado.id,
          type: 'dados' as const,
          codigo: `PL.${dado.id.substring(0,8)}`,
          nome: dado.nome_planilha,
          macroProcesso: dado.macro_processo,
          processo: dado.processo_nome,
          processId: dado.processo_id,
          responsavel: dado.responsavel_manutencao,
          validacao_etapa: dado.validacao_etapa || 0,
          status: dado.status,
          created_at: dado.created_at,
          updated_at: dado.updated_at,
          diasComResponsavel: dado.updated_at ? differenceInDays(new Date(), new Date(dado.updated_at)) : 0
        })),
        
        // Riscos
        ...(riscos || []).filter(risco => risco.processos).map(risco => ({
          id: risco.id,
          type: 'risco' as const,
          codigo: risco.codigo || `RI.${risco.id.substring(0,8)}`,
          nome: risco.nome,
          macroProcesso: risco.processos.macro_processo,
          processo: risco.processos.nome,
          processId: risco.processos.id,
          risco: risco.nome,
          riscoId: risco.id,
          responsavel: risco.responsavel,
          validacao_etapa: risco.validacao_etapa || 0,
          status: risco.status,
          created_at: risco.created_at,
          updated_at: risco.updated_at,
          diasComResponsavel: risco.updated_at ? differenceInDays(new Date(), new Date(risco.updated_at)) : 0
        })),
        
        // Controles
        ...(controles || []).filter(controle => controle.riscos?.processos).map(controle => ({
          id: controle.id,
          type: 'controle' as const,
          codigo: controle.codigo || `CT.${controle.id.substring(0,8)}`,
          nome: controle.nome,
          macroProcesso: controle.riscos.processos.macro_processo,
          processo: controle.riscos.processos.nome,
          processId: controle.riscos.processos.id,
          risco: controle.riscos.nome,
          riscoId: controle.riscos.id,
          controle: controle.nome,
          controleId: controle.id,
          responsavel: controle.responsavel,
          validacao_etapa: controle.validacao_etapa || 0,
          status: controle.status,
          created_at: controle.created_at,
          updated_at: controle.updated_at,
          diasComResponsavel: controle.updated_at ? differenceInDays(new Date(), new Date(controle.updated_at)) : 0
        })),
        
        // Testes
        ...(testes || []).filter(teste => teste.kris?.riscos?.processos).map(teste => ({
          id: teste.id,
          type: 'teste' as const,
          codigo: teste.codigo || `TD.${teste.id.substring(0,8)}`,
          nome: teste.nome,
          macroProcesso: teste.kris.riscos.processos.macro_processo,
          processo: teste.kris.riscos.processos.nome,
          processId: teste.kris.riscos.processos.id,
          risco: teste.kris.riscos.nome,
          riscoId: teste.kris.riscos.id,
          controle: teste.kris.nome,
          controleId: teste.kris.id,
          responsavel: teste.executor,
          validacao_etapa: teste.validacao_etapa || 0,
          status: teste.data_execucao ? 'Concluído' : 'Pendente',
          created_at: teste.created_at,
          updated_at: teste.updated_at,
          diasComResponsavel: teste.updated_at ? differenceInDays(new Date(), new Date(teste.updated_at)) : 0
        }))
      ];

      setDeliverables(allDeliverables);

      // Gerar opções de filtro
      const macroProcessos = [...new Set(allDeliverables.map(d => d.macroProcesso))];
      setMacroProcessOptions([
        { value: "all", label: "Todos os Macro Processos" },
        ...macroProcessos.map(mp => ({ value: mp, label: mp }))
      ]);

      // Inicialmente, mostrar todos os processos
      const processosList = [...new Set(allDeliverables.map(d => d.processo))];
      setProcessOptions([
        { value: "all", label: "Todos os Processos" },
        ...processosList.map(p => ({ value: p, label: p }))
      ]);

    } catch (error) {
      console.error('Erro ao buscar entregáveis:', error);
      toast({
        title: "Erro de Conectividade",
        description: "Falha na conexão com o servidor. Verifique sua internet e tente novamente.",
        variant: "destructive",
      });
      setDeliverables([]); // Show empty state instead of hanging
    } finally {
      setLoading(false);
    }
  };

  // Group deliverables by process for executive view
  const processGroups = useMemo(() => {
    const groups = new Map();
    
    deliverables.forEach(deliverable => {
      const key = `${deliverable.processId}`;
      if (!groups.has(key)) {
        groups.set(key, {
          processId: deliverable.processId,
          macroProcesso: deliverable.macroProcesso,
          processo: deliverable.processo,
          fluxograma: null, // Processo
          raci: null, // RACI
          descritivo: null, // Descritivo
          matrizRisco: null, // Risco
          controles: null, // Controle
          testesDesenho: null, // Teste
          kris: null, // KRI
          melhorias: null, // Melhorias
          sistemasDados: null, // Dados/Planilhas
        });
      }
      
      const group = groups.get(key);
      
      // Map deliverables to their respective columns
      if (deliverable.type === 'processo') {
        group.fluxograma = deliverable;
      } else if (deliverable.type === 'raci') {
        group.raci = deliverable;
      } else if (deliverable.type === 'descritivo') {
        group.descritivo = deliverable;
      } else if (deliverable.type === 'dados') {
        group.sistemasDados = deliverable;
      } else if (deliverable.type === 'risco') {
        group.matrizRisco = deliverable;
      } else if (deliverable.type === 'controle') {
        group.controles = deliverable;
        // Also populate KRIs column since KRIs are controls
        group.kris = deliverable;
      } else if (deliverable.type === 'teste') {
        group.testesDesenho = deliverable;
      }
    });
    
    return Array.from(groups.values());
  }, [deliverables]);

  // Filter process groups based on search and filters
  const filteredProcessGroups = useMemo(() => {
    return processGroups.filter(group => {
      const searchMatch = group.processo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.macroProcesso.toLowerCase().includes(searchQuery.toLowerCase());
      
      const macroProcessMatch = selectedMacroProcess === "all" || group.macroProcesso === selectedMacroProcess;
      const processMatch = selectedProcess === "all" || group.processo === selectedProcess;
      
      // Status filter - check if any deliverable in the group matches the status
      let statusMatch = selectedStatus === "all";
      if (!statusMatch) {
        const deliverables = [group.fluxograma, group.raci, group.descritivo, group.matrizRisco, group.controles, group.testesDesenho, group.kris, group.melhorias, group.sistemasDados];
        statusMatch = deliverables.some(d => d && d.validacao_etapa.toString() === selectedStatus);
      }

      return searchMatch && macroProcessMatch && processMatch && statusMatch;
    });
  }, [searchQuery, selectedMacroProcess, selectedProcess, selectedStatus, processGroups]);

  // Memoized statistics for performance
  const statistics = useMemo(() => {
    const total = deliverables.length;
    const naoIniciado = deliverables.filter(d => d.validacao_etapa === 0).length;
    const emDesenvolvimento = deliverables.filter(d => d.validacao_etapa === 1).length;
    const emRevisao = deliverables.filter(d => d.validacao_etapa === 2).length;
    const aprovacaoQACI = deliverables.filter(d => d.validacao_etapa === 3).length;
    const aprovacaoCliente = deliverables.filter(d => d.validacao_etapa === 4).length;
    const aprovacaoCI = deliverables.filter(d => d.validacao_etapa === 5).length;
    const concluido = deliverables.filter(d => d.validacao_etapa === 6).length;
    
    return { 
      total, 
      naoIniciado,
      emDesenvolvimento, 
      emRevisao, 
      aprovacaoQACI, 
      aprovacaoCliente,
      aprovacaoCI,
      concluido
    };
  }, [deliverables]);

  const getStatusBadge = (validacao_etapa: number) => {
    switch (validacao_etapa) {
      case 0:
        return <Badge variant="secondary">Não Iniciado</Badge>;
      case 1:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Em desenvolvimento</Badge>;
      case 2:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Em revisão</Badge>;
      case 3:
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Aprovação QA CI</Badge>;
      case 4:
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Aprovação Cliente</Badge>;
      case 5:
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aprovação CI</Badge>;
      case 6:
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Concluído</Badge>;
      default:
        return <Badge>Indefinido</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'processo':
        return <GitBranch className="w-4 h-4 text-blue-500" />;
      case 'risco':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'controle':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'teste':
        return <Target className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'processo':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processo</Badge>;
      case 'risco':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Risco</Badge>;
      case 'controle':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Controle</Badge>;
      case 'teste':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Teste</Badge>;
      default:
        return <Badge>Indefinido</Badge>;
    }
  };

  const handleViewProcess = (processId: string) => {
    onProcessClick?.(processId);
  };

  const handleOpenApprovalModal = (processId: string, processName: string) => {
    // Filtrar entregáveis do processo específico
    const processDeliverables = deliverables.filter(d => d.processId === processId);
    
    setSelectedProcessForApproval({
      id: processId,
      name: processName,
      deliverables: processDeliverables
    });
    setIsApprovalModalOpen(true);
  };

  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedProcessForApproval(null);
    // Recarregar dados para atualizar a view
    fetchDeliverables();
  };

  const renderDeliverableCell = (deliverable: Deliverable | null) => {
    if (!deliverable) {
      return <div className="text-center text-gray-400">-</div>;
    }
    
    return (
      <div className="text-center space-y-1">
        {getStatusBadge(deliverable.validacao_etapa)}
        {deliverable.diasComResponsavel !== undefined && deliverable.diasComResponsavel > 0 && (
          <div className="text-xs text-orange-600 font-medium">
            {deliverable.diasComResponsavel} dias
          </div>
        )}
      </div>
    );
  };

  const handleViewSchedule = () => {
    onScheduleClick?.();
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando entregáveis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Desenvolvimento</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.emDesenvolvimento}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovação CI</p>
                <p className="text-2xl font-bold text-green-600">{statistics.aprovacaoCI}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluído</p>
                <p className="text-2xl font-bold text-emerald-600">{statistics.concluido}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Executiva - Controle de Entregas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                type="text"
                placeholder="Buscar processo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedMacroProcess} onValueChange={setSelectedMacroProcess}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por macro processo" />
              </SelectTrigger>
              <SelectContent>
                {macroProcessOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedProcess} onValueChange={setSelectedProcess}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por processo" />
              </SelectTrigger>
              <SelectContent>
                {processOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleViewSchedule}>
              <Calendar className="w-4 h-4 mr-2" />
              Ver Cronograma
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Executive Table */}
      <Card>
        <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Macro Processo</TableHead>
                    <TableHead className="w-48">Processo</TableHead>
                    <TableHead className="w-24 text-center">1. Fluxo</TableHead>
                    <TableHead className="w-24 text-center">2. RACI</TableHead>
                    <TableHead className="w-24 text-center">3. Desc.</TableHead>
                    <TableHead className="w-24 text-center">4. Riscos</TableHead>
                    <TableHead className="w-24 text-center">5. Controles</TableHead>
                    <TableHead className="w-24 text-center">6. Testes</TableHead>
                    <TableHead className="w-24 text-center">7. KRIs</TableHead>
                    <TableHead className="w-24 text-center">8. Melhorias</TableHead>
                    <TableHead className="w-24 text-center">9. Dados</TableHead>
                    <TableHead className="w-20 text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcessGroups.map(group => (
                    <TableRow key={group.processId}>
                      <TableCell className="font-medium text-sm">{group.macroProcesso}</TableCell>
                      <TableCell className="max-w-48">
                         <Button
                           variant="link"
                           className="p-0 h-auto text-blue-600 text-left whitespace-normal break-words text-sm"
                           onClick={() => handleOpenApprovalModal(group.processId, group.processo)}
                         >
                           <div>{group.processo}</div>
                         </Button>
                      </TableCell>
                      <TableCell>{renderDeliverableCell(group.fluxograma)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.raci)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.descritivo)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.matrizRisco)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.controles)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.testesDesenho)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.kris)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.melhorias)}</TableCell>
                      <TableCell>{renderDeliverableCell(group.sistemasDados)}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProcess(group.processId)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Ver detalhes do processo"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        </CardContent>
      </Card>

      {/* Modal de Controle de Aprovações */}
      {selectedProcessForApproval && (
        <DeliverableApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={handleCloseApprovalModal}
          processId={selectedProcessForApproval.id}
          processName={selectedProcessForApproval.name}
          deliverables={selectedProcessForApproval.deliverables}
        />
      )}
    </div>
  );
};

export default DeliverableControl;