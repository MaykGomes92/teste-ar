
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardChartsProps {
  selectedProjectId?: string;
}

const DashboardCharts = ({ selectedProjectId }: DashboardChartsProps) => {
  const [riskDistribution, setRiskDistribution] = useState([
    { name: 'Alto', value: 12, color: '#dc2626' },
    { name: 'Médio', value: 45, color: '#f59e0b' },
    { name: 'Baixo', value: 77, color: '#10b981' }
  ]);

  const [controlsData, setControlsData] = useState([
    { name: 'Implementados', value: 0, color: '#10b981' },
    { name: 'Em Desenvolvimento', value: 0, color: '#f59e0b' },
    { name: 'Planejados', value: 0, color: '#6b7280' }
  ]);

  // Novos estados para os dados específicos solicitados
  const [riskImpactData, setRiskImpactData] = useState<{[key: string]: number}>({});
  const [riskCriticityData, setRiskCriticityData] = useState<{[key: string]: number}>({});
  const [controlCategoryData, setControlCategoryData] = useState<{[key: string]: number}>({});
  const [testResultData, setTestResultData] = useState<{[key: string]: number}>({});
  const [totalCounts, setTotalCounts] = useState({
    risks: 0,
    controls: 0,
    tests: 0
  });

  useEffect(() => {
    if (selectedProjectId) {
      fetchRealData();
    }
  }, [selectedProjectId]);

  const fetchRealData = async () => {
    try {
      // Buscar dados detalhados de riscos
      const { data: riscos } = await supabase
        .from('riscos')
        .select('nivel_impacto, categoria, probabilidade')
        .eq('project_info_id', selectedProjectId);

      if (riscos) {
        // Distribuição por impacto
        const impactData: {[key: string]: number} = {};
        riscos.forEach(r => {
          impactData[r.nivel_impacto] = (impactData[r.nivel_impacto] || 0) + 1;
        });
        setRiskImpactData(impactData);

        // Distribuição por categoria (usando como proxy para criticidade)
        const criticityData: {[key: string]: number} = {};
        riscos.forEach(r => {
          criticityData[r.categoria] = (criticityData[r.categoria] || 0) + 1;
        });
        setRiskCriticityData(criticityData);

        // Atualizar distribuição original
        setRiskDistribution([
          { name: 'Alto', value: impactData.Alto || 0, color: '#dc2626' },
          { name: 'Médio', value: impactData.Médio || 0, color: '#f59e0b' },
          { name: 'Baixo', value: impactData.Baixo || 0, color: '#10b981' }
        ]);

        setTotalCounts(prev => ({ ...prev, risks: riscos.length }));
      }

      // Buscar dados detalhados de controles
      const { data: controles } = await supabase
        .from('kris')
        .select('status, categoria')
        .eq('project_info_id', selectedProjectId);

      if (controles) {
        // Status dos controles
        const controlStatus = {
          Ativo: controles.filter(c => c.status === 'Ativo').length,
          'Em Desenvolvimento': controles.filter(c => c.status === 'Em Desenvolvimento').length,
          Inativo: controles.filter(c => c.status === 'Inativo').length
        };

        setControlsData([
          { name: 'Implementados', value: controlStatus.Ativo, color: '#10b981' },
          { name: 'Em Desenvolvimento', value: controlStatus['Em Desenvolvimento'], color: '#f59e0b' },
          { name: 'Inativos', value: controlStatus.Inativo, color: '#6b7280' }
        ]);

        // Categoria dos controles (Operacional, Financeiro, etc.)
        const categoryData: {[key: string]: number} = {};
        controles.forEach(c => {
          categoryData[c.categoria] = (categoryData[c.categoria] || 0) + 1;
        });
        setControlCategoryData(categoryData);

        setTotalCounts(prev => ({ ...prev, controls: controles.length }));
      }

      // Buscar dados de testes
      const { data: testes } = await supabase
        .from('testes')
        .select('maturidade, mitigacao')
        .eq('project_info_id', selectedProjectId);

      if (testes) {
        // Resultado dos testes baseado em maturidade e mitigação
        const resultData: {[key: string]: number} = {};
        testes.forEach(t => {
          // Considera "Atende" se tem maturidade >= 3 ou mitigação >= 3
          const resultado = (t.maturidade >= 3 || t.mitigacao >= 3) ? 'Atende' : 'Não Atende';
          resultData[resultado] = (resultData[resultado] || 0) + 1;
        });
        setTestResultData(resultData);

        setTotalCounts(prev => ({ ...prev, tests: testes.length }));
      }
    } catch (error) {
      console.error('Erro ao buscar dados para o dashboard:', error);
    }
  };

  const maturityTrend = [
    { month: 'Jan', score: 2.1 },
    { month: 'Fev', score: 2.3 },
    { month: 'Mar', score: 2.8 },
    { month: 'Abr', score: 3.1 },
    { month: 'Mai', score: 3.4 },
    { month: 'Jun', score: 3.7 }
  ];

  const costBenefitData = [
    { category: 'Automação', investimento: 120000, beneficio: 480000, roi: 300 },
    { category: 'Controles', investimento: 80000, beneficio: 240000, roi: 200 },
    { category: 'Treinamento', investimento: 45000, beneficio: 180000, roi: 300 },
    { category: 'Tecnologia', investimento: 200000, beneficio: 600000, roi: 200 }
  ];

  return (
    <>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Riscos Críticos por Categoria
            </CardTitle>
            <CardDescription>Análise executiva dos riscos de alto impacto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-700">
                      {riskImpactData.Alto || 0}
                    </div>
                    <p className="text-sm text-red-600">Riscos Críticos</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-slate-700">
                      {totalCounts.risks}
                    </div>
                    <p className="text-sm text-slate-500">Total de Riscos</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls Status */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Status dos Controles
            </CardTitle>
            <CardDescription>Total de controles e análise de testes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center pb-4 border-b">
                <div className="text-3xl font-bold text-slate-800">{totalCounts.controls}</div>
                <p className="text-sm text-slate-500">Total de Controles</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-slate-700">Por Categoria:</h4>
                <div className="space-y-2">
                  {Object.entries(controlCategoryData).map(([categoria, count]) => (
                    <div key={categoria} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{categoria}</span>
                      <span className="text-sm font-medium text-slate-800">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center pb-3">
                  <div className="text-2xl font-bold text-blue-600">{totalCounts.tests}</div>
                  <p className="text-sm text-slate-500">Testes de Desenho</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-700">Resultado dos Testes:</h4>
                  {Object.entries(testResultData).map(([resultado, count]) => (
                    <div key={resultado} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">{resultado}</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: resultado === 'Atende' ? '#10b981' : '#dc2626' 
                          }}
                        />
                        <span className="text-sm font-medium text-slate-800">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maturity Evolution */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Evolução da Maturidade
            </CardTitle>
            <CardDescription>Score de maturidade dos processos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={maturityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROI Analysis */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Análise de Retorno sobre Investimento
          </CardTitle>
          <CardDescription>Investimento vs. Benefício por categoria de melhoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={costBenefitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
              <Bar dataKey="investimento" fill="#ef4444" name="Investimento" />
              <Bar dataKey="beneficio" fill="#10b981" name="Benefício" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardCharts;
