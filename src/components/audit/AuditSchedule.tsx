import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface AuditScheduleProps {
  selectedProjectId?: string;
  onRefreshCounts?: () => void;
}

const AuditSchedule = ({ selectedProjectId, onRefreshCounts }: AuditScheduleProps) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    quarter: '',
    status: '',
    audit_type: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchSchedules();
    }
  }, [selectedProjectId, filters]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_schedule')
        .select(`
          *,
          kris:controle_id (nome, categoria, codigo),
          processos:processo_id (nome, macro_processo)
        `)
        .eq('project_info_id', selectedProjectId)
        .eq('year', filters.year);

      if (filters.quarter) {
        query = query.eq('quarter', parseInt(filters.quarter));
      }
      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }
      if (filters.audit_type) {
        query = query.eq('audit_type', filters.audit_type as any);
      }

      const { data, error } = await query.order('planned_date', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Erro ao carregar cronograma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o cronograma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleExportToExcel = () => {
    const data = schedules.map((schedule: any) => ({
      'Ano': schedule.year,
      'Trimestre': schedule.quarter,
      'Mês': schedule.month,
      'Tipo de Teste': schedule.audit_type === 'desenho' ? 'Desenho' : 'Efetividade',
      'Controle': schedule.kris?.nome || 'N/A',
      'Código Controle': schedule.kris?.codigo || 'N/A',
      'Processo': schedule.processos?.nome || 'N/A',
      'Macro Processo': schedule.processos?.macro_processo || 'N/A',
      'Data Planejada': formatDate(schedule.planned_date),
      'Data Real': formatDate(schedule.actual_date),
      'Status': schedule.status === 'planejado' ? 'Planejado' :
                schedule.status === 'em_andamento' ? 'Em Andamento' :
                schedule.status === 'concluido' ? 'Concluído' :
                schedule.status === 'pendente' ? 'Pendente' : 'Cancelado',
      'Auditor': schedule.auditor_name || 'N/A',
      'Observações': schedule.observations || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cronograma Auditoria');
    XLSX.writeFile(wb, `cronograma_auditoria_${filters.year}.xlsx`);
    
    toast({
      title: "Sucesso",
      description: "Cronograma exportado com sucesso!",
    });
  };

  const quarters = [
    { value: '1', label: 'T1 (Jan-Mar)' },
    { value: '2', label: 'T2 (Abr-Jun)' },
    { value: '3', label: 'T3 (Jul-Set)' },
    { value: '4', label: 'T4 (Out-Dez)' }
  ];

  const statusOptions = [
    { value: 'planejado', label: 'Planejado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const auditTypeOptions = [
    { value: 'desenho', label: 'Teste de Desenho' },
    { value: 'efetividade', label: 'Teste de Efetividade' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Cronograma de Acompanhamento</h2>
            <p className="text-slate-600">Controle e acompanhamento dos testes de auditoria programados</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Ano</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Trimestre</label>
              <select
                value={filters.quarter}
                onChange={(e) => setFilters({...filters, quarter: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">Todos</option>
                {quarters.map(quarter => (
                  <option key={quarter.value} value={quarter.value}>{quarter.label}</option>
                ))}
              </select>
            </div>
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
              <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Teste</label>
              <select
                value={filters.audit_type}
                onChange={(e) => setFilters({...filters, audit_type: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">Todos</option>
                {auditTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Cronograma {filters.year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-slate-500">
                  {Object.values(filters).some(f => f !== '' && f !== filters.year) 
                    ? 'Nenhum agendamento corresponde aos filtros selecionados.'
                    : 'Nenhum agendamento de auditoria para este ano.'
                  }
                </p>
              </div>
            ) : (
              schedules.map((schedule: any) => (
                <div key={schedule.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge className={getAuditTypeColor(schedule.audit_type)}>
                          {schedule.audit_type === 'desenho' ? 'Teste de Desenho' : 'Teste de Efetividade'}
                        </Badge>
                        <Badge className={getStatusColor(schedule.status)}>
                          {schedule.status === 'planejado' ? 'Planejado' :
                           schedule.status === 'em_andamento' ? 'Em Andamento' :
                           schedule.status === 'concluido' ? 'Concluído' :
                           schedule.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          T{schedule.quarter} / {schedule.year}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-slate-800">
                        {schedule.kris?.nome || 'Controle não especificado'}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Processo:</span> {schedule.processos?.nome || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Macro Processo:</span> {schedule.processos?.macro_processo || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Auditor:</span> {schedule.auditor_name || 'A definir'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Data Planejada:</span> {formatDate(schedule.planned_date)}
                        </div>
                        {schedule.actual_date && (
                          <div>
                            <span className="font-medium">Data Real:</span> {formatDate(schedule.actual_date)}
                          </div>
                        )}
                      </div>
                      
                      {schedule.observations && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-md">
                          <span className="font-medium text-sm text-slate-700">Observações:</span>
                          <p className="text-sm text-slate-600 mt-1">{schedule.observations}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Status */}
      {schedules.length > 0 && (
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Resumo por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {statusOptions.map(status => {
                const count = schedules.filter((s: any) => s.status === status.value).length;
                return (
                  <div key={status.value} className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{count}</div>
                    <div className="text-sm text-slate-600">{status.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditSchedule;