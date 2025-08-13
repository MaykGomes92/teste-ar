import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardCheck, AlertTriangle, Target, TrendingUp, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditDashboardProps {
  selectedProjectId?: string;
  selectedProject?: any;
  counts: {
    schedules: number;
    templates: number;
    tests: number;
    actionPlans: number;
    completedTests: number;
    pendingActions: number;
  };
}

const AuditDashboard = ({ selectedProjectId, selectedProject, counts }: AuditDashboardProps) => {
  const [recentTests, setRecentTests] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [criticalFindings, setCriticalFindings] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchDashboardData();
    }
  }, [selectedProjectId]);

  const fetchDashboardData = async () => {
    try {
      // Buscar testes recentes
      const { data: testsData, error: testsError } = await supabase
        .from('audit_tests')
        .select(`
          *,
          kris:controle_id (nome, categoria),
          processos:processo_id (nome, macro_processo)
        `)
        .eq('project_info_id', selectedProjectId)
        .order('completion_date', { ascending: false })
        .limit(5);

      if (testsError) throw testsError;
      setRecentTests(testsData || []);

      // Buscar próximos agendamentos
      const today = new Date().toISOString().split('T')[0];
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('audit_schedule')
        .select(`
          *,
          kris:controle_id (nome, categoria),
          processos:processo_id (nome, macro_processo)
        `)
        .eq('project_info_id', selectedProjectId)
        .gte('planned_date', today)
        .eq('status', 'planejado')
        .order('planned_date', { ascending: true })
        .limit(5);

      if (scheduleError) throw scheduleError;
      setUpcomingSchedules(scheduleData || []);

      // Buscar achados críticos
      const { data: findingsData, error: findingsError } = await supabase
        .from('audit_action_plans')
        .select(`
          *,
          audit_tests:audit_test_id (test_name, auditor_name)
        `)
        .eq('project_info_id', selectedProjectId)
        .eq('priority', 'Alta')
        .eq('status', 'Aberto')
        .order('created_at', { ascending: false })
        .limit(5);

      if (findingsError) throw findingsError;
      setCriticalFindings(findingsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-100 text-green-800 border-green-200";
      case "em_andamento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "planejado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "efetivo": return "bg-green-100 text-green-800 border-green-200";
      case "inefetivo": return "bg-red-100 text-red-800 border-red-200";
      case "parcialmente_efetivo": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const completionRate = counts.tests > 0 ? Math.round((counts.completedTests / counts.tests) * 100) : 0;
  const effectivenessRate = Math.round(Math.random() * 30 + 70); // Simulado - calcular baseado nos resultados reais

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Taxa de Conclusão</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
            <p className="text-sm text-slate-500">{counts.completedTests} de {counts.tests} testes</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Efetividade Média</CardTitle>
              <FileCheck className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{effectivenessRate}%</div>
            <p className="text-sm text-slate-500">Score de efetividade</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Ações Pendentes</CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{counts.pendingActions}</div>
            <p className="text-sm text-slate-500">Planos de ação em aberto</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Templates Ativos</CardTitle>
              <ClipboardCheck className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{counts.templates}</div>
            <p className="text-sm text-slate-500">Processos padronizados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Testes Recentes */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Testes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTests.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhum teste realizado ainda</p>
              ) : (
                recentTests.map((test: any) => (
                  <div key={test.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{test.test_name}</h4>
                      <Badge className={getResultColor(test.test_result)}>
                        {test.test_result === 'efetivo' ? 'Efetivo' :
                         test.test_result === 'inefetivo' ? 'Inefetivo' :
                         test.test_result === 'parcialmente_efetivo' ? 'Parcial' : 'Não Testado'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>Controle: {test.kris?.nome || 'N/A'}</div>
                      <div>Processo: {test.processos?.nome || 'N/A'}</div>
                      <div>Auditor: {test.auditor_name || 'N/A'}</div>
                      <div>Conclusão: {formatDate(test.completion_date)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Próximos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSchedules.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhum agendamento próximo</p>
              ) : (
                upcomingSchedules.map((schedule: any) => (
                  <div key={schedule.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">
                        {schedule.audit_type === 'desenho' ? 'Teste de Desenho' : 'Teste de Efetividade'}
                      </h4>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status === 'planejado' ? 'Planejado' :
                         schedule.status === 'em_andamento' ? 'Em Andamento' :
                         schedule.status === 'concluido' ? 'Concluído' : schedule.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>Controle: {schedule.kris?.nome || 'N/A'}</div>
                      <div>Processo: {schedule.processos?.nome || 'N/A'}</div>
                      <div>Data Planejada: {formatDate(schedule.planned_date)}</div>
                      <div>Auditor: {schedule.auditor_name || 'A definir'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achados Críticos */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Achados Críticos (Alta Prioridade)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalFindings.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Nenhum achado crítico em aberto</p>
            ) : (
              criticalFindings.map((finding: any) => (
                <div key={finding.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{finding.finding_description}</h4>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {finding.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div><strong>Ação Recomendada:</strong> {finding.recommended_action}</div>
                    <div><strong>Responsável:</strong> {finding.responsible_person || 'A definir'}</div>
                    <div><strong>Prazo:</strong> {formatDate(finding.due_date)}</div>
                    <div><strong>Teste:</strong> {finding.audit_tests?.test_name || 'N/A'}</div>
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

export default AuditDashboard;