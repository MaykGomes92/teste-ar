import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Calendar as CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface KRIScheduleItem {
  id: string;
  nome: string;
  categoria: string;
  frequencia_medicao: string;
  responsavel: string;
  proxima_medicao: string;
  status: string;
  meta_tier1: number;
  meta_tier2: number;
  meta_tier3: number;
}

interface KRIAnnualScheduleProps {
  selectedProjectId?: string;
  filteredKris?: any[];
}

const KRIAnnualSchedule = ({ selectedProjectId, filteredKris = [] }: KRIAnnualScheduleProps) => {
  const [scheduleData, setScheduleData] = useState<KRIScheduleItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  const generateAnnualSchedule = () => {
    const schedule: KRIScheduleItem[] = [];
    const startDate = new Date(currentYear, 0, 1);
    
    filteredKris.forEach(kri => {
      const frequencyDays = getFrequencyInDays(kri.frequencia_medicao);
      const occurrences = Math.floor(365 / frequencyDays);
      
      for (let i = 0; i < occurrences; i++) {
        const testDate = new Date(startDate);
        testDate.setDate(testDate.getDate() + (i * frequencyDays));
        
        schedule.push({
          id: `${kri.id}-${i}`,
          nome: kri.nome,
          categoria: kri.categoria,
          frequencia_medicao: kri.frequencia_medicao,
          responsavel: kri.responsavel,
          proxima_medicao: testDate.toLocaleDateString('pt-BR'),
          status: kri.status,
          meta_tier1: kri.meta_tier1,
          meta_tier2: kri.meta_tier2,
          meta_tier3: kri.meta_tier3
        });
      }
    });
    
    setScheduleData(schedule.sort((a, b) => new Date(a.proxima_medicao.split('/').reverse().join('-')).getTime() - new Date(b.proxima_medicao.split('/').reverse().join('-')).getTime()));
  };

  useEffect(() => {
    generateAnnualSchedule();
  }, [filteredKris, currentYear]);

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
  };

  const getScheduleForMonth = (month: number) => {
    return scheduleData.filter(item => {
      const itemDate = new Date(item.proxima_medicao.split('/').reverse().join('-'));
      return itemDate.getMonth() === month && itemDate.getFullYear() === currentYear;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Inativo': return 'bg-gray-100 text-gray-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <CardTitle>Programação Anual de Testes KRI - {currentYear}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentYear(currentYear - 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              ← {currentYear - 1}
            </button>
            <span className="font-semibold">{currentYear}</span>
            <button
              onClick={() => setCurrentYear(currentYear + 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              {currentYear + 1} →
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => i).map(month => {
            const monthSchedule = getScheduleForMonth(month);
            return (
              <div key={month} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {getMonthName(month)}
                </h3>
                <div className="space-y-2">
                  {monthSchedule.length > 0 ? (
                    monthSchedule.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm">{item.nome}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.proxima_medicao}
                          </div>
                          <div>Freq: {item.frequencia_medicao}</div>
                          <div>Resp: {item.responsavel}</div>
                          <div className="flex gap-2 mt-2">
                            <span className="text-green-600">T1: {item.meta_tier1}</span>
                            <span className="text-yellow-600">T2: {item.meta_tier2}</span>
                            <span className="text-red-600">T3: {item.meta_tier3}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">Nenhum teste programado</p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t">
                  <p className="text-xs text-gray-600">
                    Total: {monthSchedule.length} teste{monthSchedule.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default KRIAnnualSchedule;