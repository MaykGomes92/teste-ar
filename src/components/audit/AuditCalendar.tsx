import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditCalendarProps {
  selectedProjectId?: string;
  onRefreshCounts?: () => void;
}

const AuditCalendar = ({ selectedProjectId, onRefreshCounts }: AuditCalendarProps) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchSchedules();
    }
  }, [selectedProjectId, currentYear]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_schedule')
        .select(`
          *,
          kris:controle_id (nome, categoria),
          processos:processo_id (nome, macro_processo)
        `)
        .eq('project_info_id', selectedProjectId)
        .eq('year', currentYear)
        .order('quarter', { ascending: true })
        .order('month', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o cronograma de auditoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'July', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const quarters = [
    { id: 1, name: 'T1', months: [1, 2, 3] },
    { id: 2, name: 'T2', months: [4, 5, 6] },
    { id: 3, name: 'T3', months: [7, 8, 9] },
    { id: 4, name: 'T4', months: [10, 11, 12] }
  ];

  const getSchedulesForMonth = (month: number) => {
    return schedules.filter((schedule: any) => schedule.month === month);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-100 text-green-800 border-green-200";
      case "em_andamento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "planejado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendente": return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAuditTypeColor = (type: string) => {
    switch (type) {
      case "desenho": return "bg-purple-100 text-purple-800 border-purple-200";
      case "efetividade": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header com controles de ano */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentYear(currentYear - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Calendário de Auditoria {currentYear}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentYear(currentYear + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            // TODO: Implementar modal para criar novo agendamento
            toast({
              title: "Em desenvolvimento",
              description: "Funcionalidade de agendamento em desenvolvimento",
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
              <span className="text-sm">Teste de Desenho</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-100 border border-indigo-200 rounded"></div>
              <span className="text-sm">Teste de Efetividade</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-sm">Planejado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-sm">Concluído</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendário por trimestres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quarters.map((quarter) => (
          <Card key={quarter.id} className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-center">
                {quarter.name} - {currentYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quarter.months.map((monthNum) => (
                  <div key={monthNum} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      {months[monthNum - 1]}
                    </h4>
                    <div className="space-y-2">
                      {getSchedulesForMonth(monthNum).length === 0 ? (
                        <p className="text-slate-500 text-sm italic">
                          Nenhum agendamento para este mês
                        </p>
                      ) : (
                        getSchedulesForMonth(monthNum).map((schedule: any) => (
                          <div 
                            key={schedule.id} 
                            className="border border-slate-200 rounded p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 rounded text-xs ${getAuditTypeColor(schedule.audit_type)}`}>
                                    {schedule.audit_type === 'desenho' ? 'Desenho' : 'Efetividade'}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(schedule.status)}`}>
                                    {schedule.status === 'planejado' ? 'Planejado' :
                                     schedule.status === 'em_andamento' ? 'Em Andamento' :
                                     schedule.status === 'concluido' ? 'Concluído' :
                                     schedule.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-slate-800">
                                  {schedule.kris?.nome || 'Controle não especificado'}
                                </div>
                                <div className="text-xs text-slate-600">
                                  Processo: {schedule.processos?.nome || 'N/A'}
                                </div>
                                {schedule.auditor_name && (
                                  <div className="text-xs text-slate-600">
                                    Auditor: {schedule.auditor_name}
                                  </div>
                                )}
                                {schedule.planned_date && (
                                  <div className="text-xs text-slate-600">
                                    Data: {formatDate(schedule.planned_date)}
                                  </div>
                                )}
                              </div>
                            </div>
                            {schedule.observations && (
                              <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-50 rounded">
                                {schedule.observations}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo do ano */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Resumo do Ano {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {schedules.length}
              </div>
              <div className="text-sm text-slate-600">Total Agendado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {schedules.filter((s: any) => s.audit_type === 'desenho').length}
              </div>
              <div className="text-sm text-slate-600">Testes de Desenho</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {schedules.filter((s: any) => s.audit_type === 'efetividade').length}
              </div>
              <div className="text-sm text-slate-600">Testes de Efetividade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {schedules.filter((s: any) => s.status === 'concluido').length}
              </div>
              <div className="text-sm text-slate-600">Concluídos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditCalendar;