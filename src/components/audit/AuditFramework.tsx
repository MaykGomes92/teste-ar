import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, ClipboardList, TestTube, Target, FileText, Activity } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import AuditCalendar from "./AuditCalendar";
import AuditTemplates from "./AuditTemplates";
import AuditTests from "./AuditTests";
import AuditActionPlans from "./AuditActionPlans";
import AuditSchedule from "./AuditSchedule";
import AuditDashboard from "./AuditDashboard";

interface AuditFrameworkProps {
  selectedProjectId?: string;
  selectedProject?: any;
}

const AuditFramework = ({ selectedProjectId, selectedProject }: AuditFrameworkProps) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const isMobile = useIsMobile();
  const [counts, setCounts] = useState({
    schedules: 0,
    templates: 0,
    tests: 0,
    actionPlans: 0,
    completedTests: 0,
    pendingActions: 0
  });

  useEffect(() => {
    if (selectedProjectId) {
      fetchCounts();
    }
  }, [selectedProjectId]);

  const fetchCounts = async () => {
    try {
      const queries = [
        supabase.from('audit_schedule').select('id', { count: 'exact' }).eq('project_info_id', selectedProjectId),
        supabase.from('audit_process_templates').select('id', { count: 'exact' }).eq('project_info_id', selectedProjectId),
        supabase.from('audit_tests').select('id', { count: 'exact' }).eq('project_info_id', selectedProjectId),
        supabase.from('audit_action_plans').select('id', { count: 'exact' }).eq('project_info_id', selectedProjectId),
        supabase.from('audit_tests').select('id', { count: 'exact' }).eq('project_info_id', selectedProjectId).eq('status', 'concluido'),
        supabase.from('audit_action_plans').select('id', { count: 'exact' }).eq('project_info_id', selectedProjectId).eq('status', 'Aberto')
      ];

      const results = await Promise.all(queries);
      
      setCounts({
        schedules: results[0].count || 0,
        templates: results[1].count || 0,
        tests: results[2].count || 0,
        actionPlans: results[3].count || 0,
        completedTests: results[4].count || 0,
        pendingActions: results[5].count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar contadores de auditoria:', error);
    }
  };

  const modules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Activity, 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      count: counts.tests
    },
    { 
      id: 'calendar', 
      name: 'Calendário Anual', 
      icon: Calendar, 
      color: 'bg-green-100 text-green-800 border-green-200',
      count: counts.schedules
    },
    { 
      id: 'templates', 
      name: 'Templates', 
      icon: ClipboardList, 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      count: counts.templates
    },
    { 
      id: 'schedule', 
      name: 'Cronograma', 
      icon: FileText, 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      count: counts.schedules
    },
    { 
      id: 'tests', 
      name: 'Testes', 
      icon: TestTube, 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      count: counts.tests
    },
    { 
      id: 'actionPlans', 
      name: 'Planos de Ação', 
      icon: Target, 
      color: 'bg-red-100 text-red-800 border-red-200',
      count: counts.actionPlans
    }
  ];

  const renderModuleCard = (module: any) => {
    const Icon = module.icon;
    const isActive = activeModule === module.id;
    
    return (
      <Button
        key={module.id}
        variant={isActive ? "default" : "outline"}
        className={`flex items-center gap-3 h-auto p-4 min-w-fit transition-all duration-200 cursor-pointer ${isActive ? 'bg-[#8ca9ad] text-white hover:bg-[#8ca9ad]/90' : 'hover:shadow-md'}`}
        onClick={() => setActiveModule(module.id)}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <Badge className={`${module.color} text-sm px-2 py-1`}>
          {module.count}
        </Badge>
        <span className="text-sm font-medium">
          {module.name}
        </span>
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Framework de Auditoria COSO</h1>
          <p className="text-slate-600 mt-2">
            Sistema integrado para planejamento, execução e acompanhamento de auditorias de controles internos
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Módulos de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center gap-4 ${isMobile ? 'flex-wrap justify-center' : 'overflow-x-auto'} pb-2`}>
            {modules.map((module, index) => (
              <div key={module.id} className="flex items-center gap-4">
                {renderModuleCard(module)}
                {index < modules.length - 1 && !isMobile && (
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Content */}
      <div className="min-h-screen">
        {activeModule === 'dashboard' && (
          <AuditDashboard 
            selectedProjectId={selectedProjectId}
            selectedProject={selectedProject}
            counts={counts}
          />
        )}
        {activeModule === 'calendar' && (
          <AuditCalendar 
            selectedProjectId={selectedProjectId}
            onRefreshCounts={fetchCounts}
          />
        )}
        {activeModule === 'templates' && (
          <AuditTemplates 
            selectedProjectId={selectedProjectId}
            onRefreshCounts={fetchCounts}
          />
        )}
        {activeModule === 'schedule' && (
          <AuditSchedule 
            selectedProjectId={selectedProjectId}
            onRefreshCounts={fetchCounts}
          />
        )}
        {activeModule === 'tests' && (
          <AuditTests 
            selectedProjectId={selectedProjectId}
            onRefreshCounts={fetchCounts}
          />
        )}
        {activeModule === 'actionPlans' && (
          <AuditActionPlans 
            selectedProjectId={selectedProjectId}
            onRefreshCounts={fetchCounts}
          />
        )}
      </div>
    </div>
  );
};

export default AuditFramework;