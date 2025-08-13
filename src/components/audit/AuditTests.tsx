import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestTube, Plus, Eye, Edit, FileText, Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditTestsProps {
  selectedProjectId?: string;
  onRefreshCounts?: () => void;
}

const AuditTests = ({ selectedProjectId, onRefreshCounts }: AuditTestsProps) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    audit_type: '',
    test_result: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchTests();
    }
  }, [selectedProjectId, filters]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_tests')
        .select(`
          *,
          kris:controle_id (nome, categoria, codigo),
          processos:processo_id (nome, macro_processo),
          riscos:risco_id (nome, codigo),
          audit_schedule:schedule_id (planned_date, quarter, year),
          audit_process_templates:template_id (name)
        `)
        .eq('project_info_id', selectedProjectId);

      if (filters.status) {
        query = query.eq('status', filters.status as any);
      }
      if (filters.audit_type) {
        query = query.eq('audit_type', filters.audit_type as any);
      }
      if (filters.test_result) {
        query = query.eq('test_result', filters.test_result as any);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Erro ao carregar testes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os testes de auditoria",
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

  const getResultColor = (result: string) => {
    switch (result) {
      case "efetivo": return "bg-green-100 text-green-800 border-green-200";
      case "inefetivo": return "bg-red-100 text-red-800 border-red-200";
      case "parcialmente_efetivo": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "nao_testado": return "bg-gray-100 text-gray-800 border-gray-200";
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

  const resultOptions = [
    { value: 'efetivo', label: 'Efetivo' },
    { value: 'inefetivo', label: 'Inefetivo' },
    { value: 'parcialmente_efetivo', label: 'Parcialmente Efetivo' },
    { value: 'nao_testado', label: 'Não Testado' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TestTube className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Realização de Testes</h2>
            <p className="text-slate-600">Execução e documentação dos testes de auditoria de controles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              toast({
                title: "Em desenvolvimento",
                description: "Funcionalidade de criação de teste em desenvolvimento",
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Teste
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Resultado</label>
              <select
                value={filters.test_result}
                onChange={(e) => setFilters({...filters, test_result: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
              >
                <option value="">Todos</option>
                {resultOptions.map(result => (
                  <option key={result.value} value={result.value}>{result.label}</option>
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
            <CardTitle className="text-sm font-medium text-slate-600">Total de Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{tests.length}</div>
            <p className="text-sm text-slate-500">Testes registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {tests.filter((t: any) => t.status === 'concluido').length}
            </div>
            <p className="text-sm text-slate-500">
              {tests.length > 0 ? Math.round((tests.filter((t: any) => t.status === 'concluido').length / tests.length) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Efetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {tests.filter((t: any) => t.test_result === 'efetivo').length}
            </div>
            <p className="text-sm text-slate-500">Controles efetivos</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Efetividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {tests.filter((t: any) => t.test_result === 'efetivo').length > 0 ? 
                Math.round((tests.filter((t: any) => t.test_result === 'efetivo').length / 
                tests.filter((t: any) => t.test_result !== 'nao_testado').length) * 100) || 0 : 0}%
            </div>
            <p className="text-sm text-slate-500">Taxa de efetividade</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Testes */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Testes de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.length === 0 ? (
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  Nenhum teste encontrado
                </h3>
                <p className="text-slate-500">
                  {Object.values(filters).some(f => f !== '') 
                    ? 'Nenhum teste corresponde aos filtros selecionados.'
                    : 'Nenhum teste de auditoria registrado ainda.'
                  }
                </p>
              </div>
            ) : (
              tests.map((test: any) => (
                <div key={test.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header do teste */}
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-slate-800">{test.test_name}</h4>
                        <Badge className={getAuditTypeColor(test.audit_type)}>
                          {test.audit_type === 'desenho' ? 'Desenho' : 'Efetividade'}
                        </Badge>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status === 'planejado' ? 'Planejado' :
                           test.status === 'em_andamento' ? 'Em Andamento' :
                           test.status === 'concluido' ? 'Concluído' :
                           test.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                        </Badge>
                        {test.test_result !== 'nao_testado' && (
                          <Badge className={getResultColor(test.test_result)}>
                            {test.test_result === 'efetivo' ? 'Efetivo' :
                             test.test_result === 'inefetivo' ? 'Inefetivo' :
                             test.test_result === 'parcialmente_efetivo' ? 'Parcial' : 'Não Testado'}
                          </Badge>
                        )}
                        {test.is_critical && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Crítico
                          </Badge>
                        )}
                      </div>

                      {/* Informações do controle e processo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Controle:</span> {test.kris?.nome || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Processo:</span> {test.processos?.nome || 'N/A'}
                        </div>
                        {test.riscos && (
                          <div>
                            <span className="font-medium">Risco:</span> {test.riscos.nome}
                          </div>
                        )}
                        {test.audit_process_templates && (
                          <div>
                            <span className="font-medium">Template:</span> {test.audit_process_templates.name}
                          </div>
                        )}
                      </div>

                      {/* Informações de execução */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Auditor:</span> {test.auditor_name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Revisor:</span> {test.reviewer_name || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Data do Teste:</span> {formatDate(test.test_date)}
                        </div>
                      </div>

                      {/* Score de efetividade */}
                      {test.effectiveness_score !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">Score de Efetividade:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  test.effectiveness_score >= 80 ? 'bg-green-500' :
                                  test.effectiveness_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${test.effectiveness_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{test.effectiveness_score}%</span>
                          </div>
                        </div>
                      )}

                      {/* Achados e recomendações */}
                      {test.findings && (
                        <div className="p-3 bg-slate-50 rounded-md">
                          <span className="font-medium text-sm text-slate-700">Achados:</span>
                          <p className="text-sm text-slate-600 mt-1">{test.findings}</p>
                        </div>
                      )}

                      {test.recommendations && (
                        <div className="p-3 bg-blue-50 rounded-md">
                          <span className="font-medium text-sm text-slate-700">Recomendações:</span>
                          <p className="text-sm text-slate-600 mt-1">{test.recommendations}</p>
                        </div>
                      )}

                      {/* Evidências */}
                      {test.evidence_files && test.evidence_files.length > 0 && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-600">
                            {test.evidence_files.length} evidência(s) anexada(s)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center gap-2">
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

export default AuditTests;