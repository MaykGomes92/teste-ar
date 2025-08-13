import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatusLog {
  id: string;
  created_at: string;
  status_anterior: number | null;
  status_novo: number;
  created_by_name: string;
  observacoes?: string;
}

interface Deliverable {
  id: string;
  type: 'processo' | 'dados' | 'risco' | 'controle' | 'teste' | 'raci' | 'descritivo';
  codigo: string;
  nome: string;
  validacao_etapa: number;
  responsavel?: string;
  updated_at: string;
}

interface DeliverableApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  processId: string;
  processName: string;
  deliverables: Deliverable[];
}

const getValidationOptions = (type: string) => {
  const baseOptions = [
    { value: 0, label: "Não Iniciado" },
    { value: 1, label: "Em desenvolvimento" },
    { value: 2, label: "Em revisão" },
    { value: 3, label: "Aprovação QA CI" },
    { value: 4, label: "Aprovação Cliente" },
    { value: 5, label: "Aprovação CI" },
    { value: 6, label: "Concluído" }
  ];

  switch (type) {
    case 'processo': // Fluxograma
    case 'raci': // RACI
    case 'descritivo': // Descritivo
    case 'risco': // Matriz de Risco
    case 'controle': // Controles
    case 'teste': // Testes de Desenho
    case 'kri': // KRIs
    case 'melhorias': // Melhorias
    case 'dados': // Sistemas e Dados
      return baseOptions;
    
    default:
      return baseOptions;
  }
};

const getStatusBadge = (validacao_etapa: number, type: string) => {
  const options = getValidationOptions(type);
  const option = options.find(opt => opt.value === validacao_etapa);
  const label = option?.label || "Indefinido";
  
  switch (validacao_etapa) {
    case 0:
      return <Badge variant="secondary">{label}</Badge>;
    case 1:
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{label}</Badge>;
    case 2:
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{label}</Badge>;
    case 3:
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{label}</Badge>;
    case 4:
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{label}</Badge>;
    case 5:
      return <Badge className="bg-green-100 text-green-800 border-green-200">{label}</Badge>;
    case 6:
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'processo': return 'Fluxograma';
    case 'raci': return 'RACI';
    case 'descritivo': return 'Descritivo';
    case 'risco': return 'Matriz de Risco';
    case 'controle': return 'Controles';
    case 'teste': return 'Testes de Desenho';
    case 'kri': return 'KRIs';
    case 'melhorias': return 'Melhorias';
    case 'dados': return 'Sistemas e Dados';
    default: return type;
  }
};

export const DeliverableApprovalModal = ({ 
  isOpen, 
  onClose, 
  processId, 
  processName, 
  deliverables 
}: DeliverableApprovalModalProps) => {
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && processId) {
      fetchStatusLogs();
    }
  }, [isOpen, processId]);

  const fetchStatusLogs = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_process_status_logs', { process_id: processId });
      
      if (error) throw error;
      
      // Parse the data safely
      if (Array.isArray(data)) {
        setLogs(data as unknown as StatusLog[]);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      setLogs([]);
    }
  };

  const handleStatusUpdate = async (deliverableId: string, newStatus: number, deliverableType: string) => {
    try {
      setLoading(true);
      
      // Encontrar o entregável atual
      const currentDeliverable = deliverables.find(d => d.id === deliverableId);
      if (!currentDeliverable) return;

      // Atualizar baseado no tipo de entregável
      if (deliverableType === 'processo') {
        const { error } = await supabase
          .from('processos')
          .update({ 
            validacao_etapa: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliverableId);
        if (error) throw error;
      } else if (deliverableType === 'raci') {
        // Para RACI, extrair o ID do processo real e atualizar os campos específicos
        const processId = deliverableId.replace('-raci', '');
        const statusText = newStatus === 4 ? 'aprovado' : newStatus === 2 ? 'revisao' : 'pendente';
        const { error } = await supabase
          .from('processos')
          .update({ 
            raci_validacao: statusText,
            raci_validado_por: statusText === 'aprovado' ? (await supabase.auth.getUser()).data.user?.id : null,
            raci_validado_em: statusText === 'aprovado' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', processId);
        if (error) throw error;
      } else if (deliverableType === 'descritivo') {
        // Para Descritivo, extrair o ID do processo real e atualizar os campos específicos
        const processId = deliverableId.replace('-descritivo', '');
        const statusText = newStatus === 4 ? 'aprovado' : newStatus === 2 ? 'revisao' : 'pendente';
        const { error } = await supabase
          .from('processos')
          .update({ 
            descritivo_validacao: statusText,
            descritivo_validado_por: statusText === 'aprovado' ? (await supabase.auth.getUser()).data.user?.id : null,
            descritivo_validado_em: statusText === 'aprovado' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', processId);
        if (error) throw error;
      } else if (deliverableType === 'dados') {
        const { error } = await supabase
          .from('dados_planilhas')
          .update({ 
            validacao_etapa: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliverableId);
        if (error) throw error;
      } else if (deliverableType === 'risco') {
        const { error } = await supabase
          .from('riscos')
          .update({ 
            validacao_etapa: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliverableId);
        if (error) throw error;
      } else if (deliverableType === 'controle') {
        const { error } = await supabase
          .from('kris')
          .update({ 
            validacao_etapa: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliverableId);
        if (error) throw error;
      } else if (deliverableType === 'teste') {
        const { error } = await supabase
          .from('testes')
          .update({ 
            validacao_etapa: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliverableId);
        if (error) throw error;
      } else if (deliverableType === 'melhorias') {
        const { error } = await supabase
          .from('melhorias')
          .update({ 
            validacao_etapa: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', deliverableId);
        if (error) throw error;
      }

      // Atualizar logs
      await fetchStatusLogs();
      
      toast({
        title: "Status atualizado",
        description: "O status do entregável foi atualizado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o status do entregável.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Controle de Aprovações - {processName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tabela de Entregáveis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Controle de Validação dos Entregáveis</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-40">Tipo de Entregável</TableHead>
                    <TableHead className="w-32">Código</TableHead>
                    <TableHead className="w-40">Status Atual</TableHead>
                    <TableHead className="w-48">Nova Etapa de Validação</TableHead>
                    <TableHead className="w-32">Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Todos os tipos de entregáveis sempre exibidos */}
                  {['processo', 'raci', 'descritivo', 'risco', 'controle', 'teste', 'kri', 'melhorias', 'dados'].map((type) => {
                    const deliverable = deliverables.find(d => d.type === type);
                    return (
                      <TableRow key={type} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {getTypeLabel(type)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {deliverable?.codigo || '-'}
                        </TableCell>
                        <TableCell>
                          {deliverable ? 
                            getStatusBadge(deliverable.validacao_etapa, deliverable.type) :
                            <Badge variant="secondary">Não Iniciado</Badge>
                          }
                        </TableCell>
                        <TableCell>
                          <Select
                            value={deliverable?.validacao_etapa?.toString() || "0"}
                            onValueChange={(value) => {
                              if (deliverable) {
                                handleStatusUpdate(deliverable.id, parseInt(value), deliverable.type);
                              }
                            }}
                            disabled={loading || !deliverable}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getValidationOptions(type).map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {deliverable?.responsavel ? (
                            <div className="flex items-center gap-1 text-gray-600">
                              <User className="w-3 h-3" />
                              {deliverable.responsavel}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Histórico de Mudanças */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Histórico de Mudanças</h3>
            <div className="border rounded-lg p-4 max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Nenhuma mudança registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {log.created_by_name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            <Clock className="w-3 h-3 ml-1" />
                            {format(new Date(log.created_at), "HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Status alterado:</span>
                          {log.status_anterior !== null && (
                            <>
                              <Badge variant="outline" className="text-xs">{log.status_anterior}</Badge>
                              <span className="text-gray-400">→</span>
                            </>
                          )}
                          <Badge className="text-xs">{log.status_novo}</Badge>
                        </div>
                        {log.observacoes && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Obs:</strong> {log.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};