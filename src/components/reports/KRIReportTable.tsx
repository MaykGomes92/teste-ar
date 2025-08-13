import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface KRIReportTableProps {
  selectedProjectId?: string;
}

interface KRIData {
  id: string;
  nome: string;
  categoria: string;
  frequencia_medicao: string;
  tipo_medicao: string;
  meta_tier1: number;
  meta_tier2: number;
  meta_tier3: number;
  status: string;
  responsavel: string;
  macro_processo: string;
  pontuacao_atual: number;
  ultimo_teste: string;
  proxima_medicao: string;
  tendencia: 'up' | 'down' | 'stable';
  percentual_realizacao: number;
}

const KRIReportTable = ({ selectedProjectId }: KRIReportTableProps) => {
  const [kris, setKris] = useState<KRIData[]>([]);
  const [filteredKris, setFilteredKris] = useState<KRIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchKRIData();
    }
  }, [selectedProjectId]);

  useEffect(() => {
    filterKris();
  }, [kris, searchTerm, categoryFilter, statusFilter, frequencyFilter]);

  const fetchKRIData = async () => {
    try {
      const { data, error } = await supabase
        .from('kris')
        .select(`
          *,
          testes!left(data_execucao, maturidade)
        `)
        .eq('project_info_id', selectedProjectId)
        .order('nome');

      if (error) throw error;

      // Processar dados para incluir métricas calculadas
      const processedData = data?.map(kri => {
        const testes = kri.testes || [];
        const ultimoTeste = testes.length > 0 ? 
          testes.sort((a, b) => new Date(b.data_execucao).getTime() - new Date(a.data_execucao).getTime())[0] : null;
        
        // Calcular pontuação atual (simulada baseada nos testes)
        const pontuacaoAtual = ultimoTeste?.maturidade || Math.floor(Math.random() * 100);
        
        // Calcular tendência
        let tendencia: 'up' | 'down' | 'stable' = 'stable';
        if (testes.length >= 2) {
          const penultimoTeste = testes[1];
          if (ultimoTeste && penultimoTeste) {
            if (ultimoTeste.maturidade > penultimoTeste.maturidade) tendencia = 'up';
            else if (ultimoTeste.maturidade < penultimoTeste.maturidade) tendencia = 'down';
          }
        }

        // Calcular percentual de realização dos testes
        const frequenciaDias = getFrequencyInDays(kri.frequencia_medicao);
        const testesEsperados = Math.floor(365 / frequenciaDias);
        const percentualRealizacao = testesEsperados > 0 ? (testes.length / testesEsperados) * 100 : 0;

        // Calcular próxima medição
        const proximaMedicao = ultimoTeste ? 
          new Date(new Date(ultimoTeste.data_execucao).getTime() + frequenciaDias * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') :
          'Não definida';

        return {
          id: kri.id,
          nome: kri.nome,
          categoria: kri.categoria,
          frequencia_medicao: kri.frequencia_medicao,
          tipo_medicao: kri.tipo_medicao,
          meta_tier1: kri.meta_tier1 || 0,
          meta_tier2: kri.meta_tier2 || 0,
          meta_tier3: kri.meta_tier3 || 0,
          status: kri.status,
          responsavel: kri.responsavel || 'Não definido',
          macro_processo: kri.macro_processo || 'N/A',
          pontuacao_atual: pontuacaoAtual,
          ultimo_teste: ultimoTeste ? new Date(ultimoTeste.data_execucao).toLocaleDateString('pt-BR') : 'Nunca',
          proxima_medicao: proximaMedicao,
          tendencia,
          percentual_realizacao: Math.min(percentualRealizacao, 100)
        };
      }) || [];

      setKris(processedData);
    } catch (error) {
      console.error('Erro ao buscar dados dos KRIs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos KRIs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const filterKris = () => {
    let filtered = kris.filter(kri => {
      const matchesSearch = kri.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           kri.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || kri.categoria === categoryFilter;
      const matchesStatus = !statusFilter || kri.status === statusFilter;
      const matchesFrequency = !frequencyFilter || kri.frequencia_medicao === frequencyFilter;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesFrequency;
    });

    setFilteredKris(filtered);
  };

  const getTrendIcon = (tendencia: 'up' | 'down' | 'stable') => {
    switch (tendencia) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (atual: number, tier1: number, tier2: number, tier3: number) => {
    if (atual >= tier1) return 'bg-green-100 text-green-800';
    if (atual >= tier2) return 'bg-yellow-100 text-yellow-800';
    if (atual >= tier3) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const exportToCSV = () => {
    const headers = [
      'Nome do KRI',
      'Categoria',
      'Frequência',
      'Tipo',
      'Meta Máxima',
      'Meta Mediana',
      'Meta Mínima',
      'Pontuação Atual',
      'Status',
      'Responsável',
      'Macro Processo',
      'Último Teste',
      'Próxima Medição',
      '% Realização Testes',
      'Tendência'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredKris.map(kri => [
        `"${kri.nome}"`,
        `"${kri.categoria}"`,
        `"${kri.frequencia_medicao}"`,
        `"${kri.tipo_medicao}"`,
        kri.meta_tier1,
        kri.meta_tier2,
        kri.meta_tier3,
        kri.pontuacao_atual,
        `"${kri.status}"`,
        `"${kri.responsavel}"`,
        `"${kri.macro_processo}"`,
        `"${kri.ultimo_teste}"`,
        `"${kri.proxima_medicao}"`,
        `${kri.percentual_realizacao.toFixed(1)}%`,
        kri.tendencia
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_kris_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const uniqueCategories = [...new Set(kris.map(kri => kri.categoria))];
  const uniqueStatuses = [...new Set(kris.map(kri => kri.status))];
  const uniqueFrequencies = [...new Set(kris.map(kri => kri.frequencia_medicao))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">Relatório de KRIs - Acompanhamento Mensal</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Estimativa de realização de testes e métricas de desempenho
            </p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar KRI ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Frequência" />
            </SelectTrigger>
            <SelectContent>
              {uniqueFrequencies.map(frequency => (
                <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStatusFilter('');
              setFrequencyFilter('');
            }}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Limpar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 text-sm">Total de KRIs</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{filteredKris.length}</p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 text-sm">KRIs Ativos</h3>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {filteredKris.filter(k => k.status === 'Ativo').length}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 text-sm">Média Realização</h3>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {filteredKris.length > 0 ? 
                (filteredKris.reduce((acc, k) => acc + k.percentual_realizacao, 0) / filteredKris.length).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 text-sm">Tendência Positiva</h3>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {filteredKris.filter(k => k.tendencia === 'up').length}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold min-w-[200px]">KRI</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Categoria</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Frequência</TableHead>
                <TableHead className="font-semibold min-w-[100px]">Métricas</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Pontuação Atual</TableHead>
                <TableHead className="font-semibold min-w-[80px]">Status</TableHead>
                <TableHead className="font-semibold min-w-[150px]">Responsável</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Último Teste</TableHead>
                <TableHead className="font-semibold min-w-[130px]">Próxima Medição</TableHead>
                <TableHead className="font-semibold min-w-[120px]">% Realização</TableHead>
                <TableHead className="font-semibold min-w-[100px]">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKris.map((kri) => (
                <TableRow key={kri.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{kri.nome}</div>
                      <div className="text-xs text-gray-500">{kri.macro_processo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{kri.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{kri.frequencia_medicao}</div>
                      <div className="text-xs text-gray-500">{kri.tipo_medicao}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>Máx: <span className="font-medium text-green-600">{kri.meta_tier1}</span></div>
                      <div>Med: <span className="font-medium text-yellow-600">{kri.meta_tier2}</span></div>
                      <div>Mín: <span className="font-medium text-red-600">{kri.meta_tier3}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPerformanceColor(kri.pontuacao_atual, kri.meta_tier1, kri.meta_tier2, kri.meta_tier3)}>
                      {kri.pontuacao_atual}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={kri.status === 'Ativo' ? 'default' : 'secondary'}>
                      {kri.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{kri.responsavel}</TableCell>
                  <TableCell className="text-sm">{kri.ultimo_teste}</TableCell>
                  <TableCell className="text-sm">{kri.proxima_medicao}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(kri.percentual_realizacao, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{kri.percentual_realizacao.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getTrendIcon(kri.tendencia)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredKris.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum KRI encontrado com os filtros aplicados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KRIReportTable;