import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, CheckCircle, AlertCircle, XCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ControlMoment {
  id: string;
  kri_nome: string;
  categoria: string;
  data_execucao: string;
  executor: string;
  revisor: string;
  status: 'Executado' | 'Pendente' | 'Atrasado';
  maturidade: number;
  meta_tier1: number;
  meta_tier2: number;
  meta_tier3: number;
  observacoes?: string;
  evidencias?: string[];
}

interface KRIControlMomentsProps {
  selectedProjectId?: string;
  filteredKris?: any[];
}

const KRIControlMoments = ({ selectedProjectId, filteredKris = [] }: KRIControlMomentsProps) => {
  const [controlMoments, setControlMoments] = useState<ControlMoment[]>([]);
  const [filteredMoments, setFilteredMoments] = useState<ControlMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    if (selectedProjectId) {
      fetchControlMoments();
    }
  }, [selectedProjectId]);

  useEffect(() => {
    filterMoments();
  }, [controlMoments, searchTerm, statusFilter, periodFilter]);

  const fetchControlMoments = async () => {
    try {
      const { data: testesData, error } = await supabase
        .from('testes')
        .select(`
          *,
          kris!inner(nome, categoria, meta_tier1, meta_tier2, meta_tier3)
        `)
        .eq('project_info_id', selectedProjectId)
        .order('data_execucao', { ascending: false });

      if (error) throw error;

      // Processar dados dos testes + gerar momentos futuros baseados nos KRIs filtrados
      const existingMoments: ControlMoment[] = testesData?.map(teste => {
        const kri = teste.kris;
        const status = getTestStatus(teste.data_execucao);
        
        return {
          id: teste.id,
          kri_nome: kri.nome,
          categoria: kri.categoria,
          data_execucao: teste.data_execucao,
          executor: teste.executor || 'Não definido',
          revisor: teste.revisor || 'Não definido',
          status,
          maturidade: teste.maturidade || 0,
          meta_tier1: kri.meta_tier1 || 0,
          meta_tier2: kri.meta_tier2 || 0,
          meta_tier3: kri.meta_tier3 || 0,
          observacoes: teste.descricao,
          evidencias: teste.evidencia_names
        };
      }) || [];

      // Gerar momentos futuros baseados nos KRIs filtrados
      const futureMoments = generateFutureMoments(filteredKris);
      
      const allMoments = [...existingMoments, ...futureMoments]
        .sort((a, b) => new Date(b.data_execucao).getTime() - new Date(a.data_execucao).getTime());

      setControlMoments(allMoments);
    } catch (error) {
      console.error('Erro ao buscar momentos de controle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (dataExecucao: string): 'Executado' | 'Pendente' | 'Atrasado' => {
    const testDate = new Date(dataExecucao);
    const today = new Date();
    
    if (testDate > today) return 'Pendente';
    if (testDate < today) return 'Executado';
    return 'Atrasado';
  };

  const generateFutureMoments = (kris: any[]): ControlMoment[] => {
    const futureMoments: ControlMoment[] = [];
    const today = new Date();
    
    kris.forEach(kri => {
      const frequenciaDias = getFrequencyInDays(kri.frequencia_medicao);
      
      // Gerar próximos 6 momentos de controle
      for (let i = 1; i <= 6; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + (i * frequenciaDias));
        
        futureMoments.push({
          id: `future-${kri.id}-${i}`,
          kri_nome: kri.nome,
          categoria: kri.categoria,
          data_execucao: futureDate.toISOString().split('T')[0],
          executor: kri.responsavel || 'Não definido',
          revisor: 'A definir',
          status: 'Pendente',
          maturidade: 0,
          meta_tier1: kri.meta_tier1 || 0,
          meta_tier2: kri.meta_tier2 || 0,
          meta_tier3: kri.meta_tier3 || 0
        });
      }
    });
    
    return futureMoments;
  };

  const getFrequencyInDays = (frequency: string): number => {
    switch (frequency?.toLowerCase()) {
      case 'diária': return 1;
      case 'semanal': return 7;
      case 'quinzenal': return 15;
      case 'mensal': return 30;
      case 'bimestral': return 60;
      case 'trimestral': return 90;
      case 'semestral': return 180;
      case 'anual': return 365;
      default: return 30;
    }
  };

  const filterMoments = () => {
    let filtered = controlMoments.filter(moment => {
      const matchesSearch = moment.kri_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           moment.executor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || moment.status === statusFilter;
      
      let matchesPeriod = true;
      if (periodFilter !== 'all') {
        const momentDate = new Date(moment.data_execucao);
        const today = new Date();
        
        switch (periodFilter) {
          case 'past':
            matchesPeriod = momentDate < today;
            break;
          case 'current':
            const diffTime = Math.abs(momentDate.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            matchesPeriod = diffDays <= 30;
            break;
          case 'future':
            matchesPeriod = momentDate > today;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesPeriod;
    });

    setFilteredMoments(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Executado': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pendente': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Atrasado': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Executado': return 'bg-green-100 text-green-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (maturidade: number, tier1: number, tier2: number, tier3: number) => {
    if (maturidade >= tier1) return 'bg-green-100 text-green-800';
    if (maturidade >= tier2) return 'bg-yellow-100 text-yellow-800';
    if (maturidade >= tier3) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Registros dos Momentos de Controle
          </CardTitle>
          <div className="text-sm text-gray-600">
            Total: {filteredMoments.length} registros
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar KRI ou executor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Executado">Executado</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="past">Passado</SelectItem>
              <SelectItem value="current">Próximos 30 dias</SelectItem>
              <SelectItem value="future">Futuro</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPeriodFilter('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Executados</h3>
            <p className="text-2xl font-bold text-green-600">
              {filteredMoments.filter(m => m.status === 'Executado').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800">Pendentes</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredMoments.filter(m => m.status === 'Pendente').length}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">Atrasados</h3>
            <p className="text-2xl font-bold text-red-600">
              {filteredMoments.filter(m => m.status === 'Atrasado').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Média Performance</h3>
            <p className="text-2xl font-bold text-blue-600">
              {filteredMoments.length > 0 ? 
                Math.round(filteredMoments.reduce((sum, m) => sum + m.maturidade, 0) / filteredMoments.length) : 0}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>KRI</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Executor</TableHead>
                <TableHead>Revisor</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Metas</TableHead>
                <TableHead>Evidências</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMoments.map((moment) => (
                <TableRow key={moment.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{moment.kri_nome}</div>
                      <Badge variant="outline" className="text-xs">
                        {moment.categoria}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(moment.data_execucao).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(moment.status)}
                      <Badge className={getStatusColor(moment.status)}>
                        {moment.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {moment.executor}
                    </div>
                  </TableCell>
                  <TableCell>{moment.revisor}</TableCell>
                  <TableCell>
                    {moment.maturidade > 0 ? (
                      <Badge className={getPerformanceColor(moment.maturidade, moment.meta_tier1, moment.meta_tier2, moment.meta_tier3)}>
                        {moment.maturidade}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>T1: <span className="font-medium text-green-600">{moment.meta_tier1}</span></div>
                      <div>T2: <span className="font-medium text-yellow-600">{moment.meta_tier2}</span></div>
                      <div>T3: <span className="font-medium text-red-600">{moment.meta_tier3}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {moment.evidencias && moment.evidencias.length > 0 ? (
                      <Badge variant="outline">
                        {moment.evidencias.length} arquivo{moment.evidencias.length > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 text-sm">Nenhuma</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMoments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum momento de controle encontrado com os filtros aplicados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KRIControlMoments;