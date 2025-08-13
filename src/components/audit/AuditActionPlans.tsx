import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Eye, Edit, Calendar, AlertTriangle, CheckCircle, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface AuditActionPlansProps {
  selectedProjectId?: string;
  onRefreshCounts?: () => void;
}

const AuditActionPlans = ({ selectedProjectId, onRefreshCounts }: AuditActionPlansProps) => {
  const [actionPlans, setActionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchActionPlans();
    }
  }, [selectedProjectId, filters]);

  const fetchActionPlans = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_action_plans')
        .select(`
          *,
          audit_tests:audit_test_id (test_name, auditor_name, test_result),
          kris:controle_id (nome, categoria, codigo)
        `)
        .eq('project_info_id', selectedProjectId);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setActionPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos de ação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto": return "bg-red-100 text-red-800 border-red-200";
      case "Em Andamento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelado": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "bg-red-100 text-red-800 border-red-200";
      case "Média": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Baixa": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dueDateString: string, status: string) => {
    if (!dueDateString || status === 'Concluído') return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    return dueDate < today;
  };

  const getDaysUntilDue = (dueDateString: string) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExportToExcel = () => {
    const data = actionPlans.map((plan: any) => ({
      'Código': plan.action_code || '',
      'Descrição do Achado': plan.finding_description,
      'Causa Raiz': plan.root_cause || '',
      'Ação Recomendada': plan.recommended_action,
      'Prioridade': plan.priority,
      'Status': plan.status,
      'Responsável': plan.responsible_person || '',
      'Revisor': plan.reviewer_person || '',
      'Data Limite': formatDate(plan.due_date),
      'Data Conclusão': formatDate(plan.completion_date),
      'Progresso (%)': plan.progress_percentage || 0,
      'Controle': plan.kris?.nome || '',
      'Teste': plan.audit_tests?.test_name || '',
      'Criado em': formatDate(plan.created_at)
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planos de Ação');
    XLSX.writeFile(wb, `planos_acao_auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Sucesso",
      description: "Planos de ação exportados com sucesso!",
    });
  };

  const statusOptions = [
    { value: 'Aberto', label: 'Aberto' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Concluído', label: 'Concluído' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const priorityOptions = [
    { value: 'Alta', label: 'Alta' },
    { value: 'Média', label: 'Média' },
    { value: 'Baixa', label: 'Baixa' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Planos de Ação</h2>
            <p className="text-slate-600">Gestão e acompanhamento dos planos de ação de auditoria</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportToExcel}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              toast({
                title: "Em desenvolvimento",
                description: "Funcionalidade de criação de plano de ação em desenvolvimento",
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">Todos</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Prioridade</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">Todas</option>
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{actionPlans.length}</div>
            <p className="text-sm text-slate-500">Planos registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Em Aberto</CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {actionPlans.filter((p: any) => p.status === 'Aberto').length}
            </div>
            <p className="text-sm text-slate-500">Aguardando início</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Em Andamento</CardTitle>
              <Calendar className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {actionPlans.filter((p: any) => p.status === 'Em Andamento').length}
            </div>
            <p className="text-sm text-slate-500">Em execução</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Concluídos</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {actionPlans.filter((p: any) => p.status === 'Concluído').length}
            </div>
            <p className="text-sm text-slate-500">
              {actionPlans.length > 0 ? Math.round((actionPlans.filter((p: any) => p.status === 'Concluído').length / actionPlans.length) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos de Ação */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actionPlans.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Nenhum plano de ação encontrado
                </h3>
                <p className="text-slate-500">
                  {Object.values(filters).some(f => f !== '') 
                    ? 'Nenhum plano corresponde aos filtros selecionados.'
                    : 'Nenhum plano de ação registrado ainda.'
                  }
                </p>
              </div>
            ) : (
              actionPlans.map((plan: any) => (
                <div key={plan.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isOverdue(plan.due_date, plan.status) ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header do plano */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getPriorityColor(plan.priority)}>
                              {plan.priority}
                            </Badge>
                            <Badge className={getStatusColor(plan.status)}>
                              {plan.status}
                            </Badge>
                            {isOverdue(plan.due_date, plan.status) && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Vencido
                              </Badge>
                            )}
                            {plan.action_code && (
                              <span className="text-sm text-slate-600 font-mono">
                                {plan.action_code}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-2">
                            {plan.finding_description}
                          </h4>
                        </div>
                        
                        {/* Days until due */}
                        {plan.due_date && plan.status !== 'Concluído' && (
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              isOverdue(plan.due_date, plan.status) ? 'text-red-600' : 
                              getDaysUntilDue(plan.due_date) <= 7 ? 'text-yellow-600' : 'text-slate-600'
                            }`}>
                              {isOverdue(plan.due_date, plan.status) ? 
                                `Vencido há ${Math.abs(getDaysUntilDue(plan.due_date))} dias` :
                                getDaysUntilDue(plan.due_date) === 0 ? 'Vence hoje' :
                                getDaysUntilDue(plan.due_date) === 1 ? 'Vence amanhã' :
                                `${getDaysUntilDue(plan.due_date)} dias restantes`
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Causa raiz e ação recomendada */}
                      {plan.root_cause && (
                        <div className="p-3 bg-slate-50 rounded-md">
                          <span className="font-medium text-sm text-slate-700">Causa Raiz:</span>
                          <p className="text-sm text-slate-600 mt-1">{plan.root_cause}</p>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 rounded-md">
                        <span className="font-medium text-sm text-slate-700">Ação Recomendada:</span>
                        <p className="text-sm text-slate-600 mt-1">{plan.recommended_action}</p>
                      </div>

                      {/* Informações de responsabilidade e prazos */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Responsável:</span> {plan.responsible_person || 'A definir'}
                        </div>
                        <div>
                          <span className="font-medium">Revisor:</span> {plan.reviewer_person || 'A definir'}
                        </div>
                        <div>
                          <span className="font-medium">Data Limite:</span> {formatDate(plan.due_date)}
                        </div>
                      </div>

                      {/* Progresso */}
                      {plan.progress_percentage !== null && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Progresso</span>
                            <span className="text-sm font-semibold text-slate-800">
                              {plan.progress_percentage}%
                            </span>
                          </div>
                          <Progress value={plan.progress_percentage} className="h-2" />
                        </div>
                      )}

                      {/* Informações do teste relacionado */}
                      {plan.audit_tests && (
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                          <span className="font-medium">Teste Relacionado:</span> {plan.audit_tests.test_name}
                          {plan.audit_tests.auditor_name && (
                            <span className="ml-2">| Auditor: {plan.audit_tests.auditor_name}</span>
                          )}
                        </div>
                      )}

                      {/* Evidências de implementação */}
                      {plan.implementation_evidence && (
                        <div className="p-3 bg-green-50 rounded-md">
                          <span className="font-medium text-sm text-slate-700">Evidência de Implementação:</span>
                          <p className="text-sm text-slate-600 mt-1">{plan.implementation_evidence}</p>
                        </div>
                      )}

                      {/* Notas de acompanhamento */}
                      {plan.follow_up_notes && (
                        <div className="p-3 bg-yellow-50 rounded-md">
                          <span className="font-medium text-sm text-slate-700">Notas de Acompanhamento:</span>
                          <p className="text-sm text-slate-600 mt-1">{plan.follow_up_notes}</p>
                        </div>
                      )}

                      {/* Data de conclusão */}
                      {plan.completion_date && (
                        <div className="text-sm text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Concluído em {formatDate(plan.completion_date)}
                        </div>
                      )}
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditActionPlans;