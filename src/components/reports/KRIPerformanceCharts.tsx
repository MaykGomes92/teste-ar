import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3 } from "lucide-react";

interface KRIData {
  id: string;
  nome: string;
  categoria: string;
  meta_tier1: number;
  meta_tier2: number;
  meta_tier3: number;
  pontuacao_atual: number;
  ultimo_teste: string;
  tendencia: 'up' | 'down' | 'stable';
}

interface KRIPerformanceChartsProps {
  filteredKris: KRIData[];
}

const KRIPerformanceCharts = ({ filteredKris }: KRIPerformanceChartsProps) => {
  const [selectedKRI, setSelectedKRI] = useState<string>('all');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  // Simular dados históricos para demonstração
  const generateHistoricalData = (kri: KRIData) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((month, index) => {
      // Simular variação baseada na tendência
      let baseValue = kri.pontuacao_atual;
      if (kri.tendencia === 'up') {
        baseValue = Math.max(0, kri.pontuacao_atual - (6 - index) * 5 + Math.random() * 10);
      } else if (kri.tendencia === 'down') {
        baseValue = Math.min(100, kri.pontuacao_atual + (6 - index) * 3 + Math.random() * 8);
      } else {
        baseValue = kri.pontuacao_atual + (Math.random() - 0.5) * 15;
      }
      
      return {
        month,
        value: Math.round(Math.max(0, Math.min(100, baseValue))),
        tier1: kri.meta_tier1,
        tier2: kri.meta_tier2,
        tier3: kri.meta_tier3,
        nome: kri.nome
      };
    });
  };

  const getSelectedKRIData = () => {
    if (selectedKRI === 'all') {
      // Média de todos os KRIs por mês
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months.map(month => {
        const monthData = filteredKris.map(kri => generateHistoricalData(kri).find(d => d.month === month)!);
        const avgValue = monthData.reduce((sum, d) => sum + d.value, 0) / monthData.length;
        const avgTier1 = monthData.reduce((sum, d) => sum + d.tier1, 0) / monthData.length;
        const avgTier2 = monthData.reduce((sum, d) => sum + d.tier2, 0) / monthData.length;
        const avgTier3 = monthData.reduce((sum, d) => sum + d.tier3, 0) / monthData.length;
        
        return {
          month,
          value: Math.round(avgValue),
          tier1: Math.round(avgTier1),
          tier2: Math.round(avgTier2),
          tier3: Math.round(avgTier3),
          nome: 'Média Geral'
        };
      });
    } else {
      const kri = filteredKris.find(k => k.id === selectedKRI);
      return kri ? generateHistoricalData(kri) : [];
    }
  };

  const chartData = getSelectedKRIData();

  const getPerformanceByCategory = () => {
    const categories = [...new Set(filteredKris.map(kri => kri.categoria))];
    return categories.map(category => {
      const categoryKRIs = filteredKris.filter(kri => kri.categoria === category);
      const avgScore = categoryKRIs.reduce((sum, kri) => sum + kri.pontuacao_atual, 0) / categoryKRIs.length;
      const avgTier1 = categoryKRIs.reduce((sum, kri) => sum + kri.meta_tier1, 0) / categoryKRIs.length;
      const avgTier2 = categoryKRIs.reduce((sum, kri) => sum + kri.meta_tier2, 0) / categoryKRIs.length;
      const avgTier3 = categoryKRIs.reduce((sum, kri) => sum + kri.meta_tier3, 0) / categoryKRIs.length;
      
      return {
        categoria: category,
        valor: Math.round(avgScore),
        tier1: Math.round(avgTier1),
        tier2: Math.round(avgTier2),
        tier3: Math.round(avgTier3),
        count: categoryKRIs.length
      };
    });
  };

  const categoryData = getPerformanceByCategory();

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Análise de Performance KRI
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedKRI} onValueChange={setSelectedKRI}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar KRI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os KRIs (Média)</SelectItem>
                  {filteredKris.map(kri => (
                    <SelectItem key={kri.id} value={kri.id}>{kri.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      value,
                      name === 'value' ? 'Pontuação' :
                      name === 'tier1' ? 'Meta Tier 1' :
                      name === 'tier2' ? 'Meta Tier 2' : 'Meta Tier 3'
                    ]}
                  />
                  <Legend />
                  
                  {/* Linhas de referência das metas */}
                  <ReferenceLine y={chartData[0]?.tier1} stroke="#22c55e" strokeDasharray="5 5" label="Tier 1" />
                  <ReferenceLine y={chartData[0]?.tier2} stroke="#eab308" strokeDasharray="5 5" label="Tier 2" />
                  <ReferenceLine y={chartData[0]?.tier3} stroke="#ef4444" strokeDasharray="5 5" label="Tier 3" />
                  
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Pontuação"
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  
                  {/* Linhas de referência das metas */}
                  <ReferenceLine y={chartData[0]?.tier1} stroke="#22c55e" strokeDasharray="5 5" label="Tier 1" />
                  <ReferenceLine y={chartData[0]?.tier2} stroke="#eab308" strokeDasharray="5 5" label="Tier 2" />
                  <ReferenceLine y={chartData[0]?.tier3} stroke="#ef4444" strokeDasharray="5 5" label="Tier 3" />
                  
                  <Bar dataKey="value" fill="#3b82f6" name="Pontuação" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Legenda das metas */}
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span>Tier 1 (Meta Máxima): {chartData[0]?.tier1}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-500"></div>
              <span>Tier 2 (Meta Mediana): {chartData[0]?.tier2}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500"></div>
              <span>Tier 3 (Meta Mínima): {chartData[0]?.tier3}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="categoria" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    value,
                    name === 'valor' ? 'Pontuação Média' :
                    name === 'tier1' ? 'Meta Tier 1' :
                    name === 'tier2' ? 'Meta Tier 2' : 'Meta Tier 3'
                  ]}
                />
                <Legend />
                
                <Bar dataKey="valor" fill="#3b82f6" name="Pontuação Média" />
                <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="5 5" />
                <ReferenceLine y={50} stroke="#eab308" strokeDasharray="5 5" />
                <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="5 5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KRIPerformanceCharts;