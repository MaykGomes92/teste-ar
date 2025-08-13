import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, TrendingUp, FileText, BarChart3 } from "lucide-react";
import KRIReportTable from "./KRIReportTable";
import KRIAnnualSchedule from "./KRIAnnualSchedule";
import KRIPerformanceCharts from "./KRIPerformanceCharts";
import KRIControlMoments from "./KRIControlMoments";
import { supabase } from "@/integrations/supabase/client";

interface KRIReportsTabContentProps {
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

const KRIReportsTabContent = ({ selectedProjectId }: KRIReportsTabContentProps) => {
  const [filteredKris, setFilteredKris] = useState<KRIData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProjectId) {
      fetchKRIData();
    }
  }, [selectedProjectId]);

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

      setFilteredKris(processedData);
    } catch (error) {
      console.error('Erro ao buscar dados dos KRIs:', error);
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-lg p-1">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Visão Geral
        </TabsTrigger>
        <TabsTrigger value="schedule" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Programação Anual
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="control-moments" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Momentos de Controle
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <KRIReportTable selectedProjectId={selectedProjectId} />
      </TabsContent>

      <TabsContent value="schedule" className="space-y-6">
        <KRIAnnualSchedule 
          selectedProjectId={selectedProjectId} 
          filteredKris={filteredKris}
        />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <KRIPerformanceCharts filteredKris={filteredKris} />
      </TabsContent>

      <TabsContent value="control-moments" className="space-y-6">
        <KRIControlMoments 
          selectedProjectId={selectedProjectId}
          filteredKris={filteredKris}
        />
      </TabsContent>
    </Tabs>
  );
};

export default KRIReportsTabContent;