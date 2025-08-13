import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, TrendingUp, AlertTriangle, Target } from "lucide-react";
import KRIReportsTabContent from "@/components/reports/KRIReportsTabContent";
import NextGenHeader from '@/components/NextGenHeader';

interface KRIReportsPageProps {
  onBackClick?: () => void;
  selectedProject?: any;
}

const KRIReportsPage = ({ onBackClick, selectedProject }: KRIReportsPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section com gradient da Orla Consultoria */}
      <section className="bg-gradient-to-br from-orla-teal via-orla-teal-dark to-orla-blue-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-block">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                Relatórios de KRIs
              </Badge>
            </div>
            
            {/* Título principal */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              <span className="text-white">Gestão de KRIs</span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-lg text-white/90 leading-relaxed">
              Monitoramento de Indicadores Chave de Risco
            </p>
            
            {/* Informações do projeto */}
            {selectedProject && (
              <div className="flex gap-4 flex-wrap">
                <Badge className="bg-white/15 text-white border-white/30 px-3 py-1">
                  {selectedProject.nome_projeto}
                </Badge>
                {selectedProject.cliente && (
                  <Badge className="bg-white/15 text-white border-white/30 px-3 py-1">
                    {selectedProject.cliente}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Action Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
              {onBackClick && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onBackClick}
                  className="bg-orla-teal text-white hover:bg-orla-teal-dark border-orla-teal hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-orla-teal text-white hover:bg-orla-teal-dark border-orla-teal hover:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* KPIs Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">KRIs Ativos</p>
                    <p className="text-lg sm:text-2xl font-bold text-orla-teal">28</p>
                  </div>
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orla-teal" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Acima do Limite</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-600">5</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Em Tendência</p>
                    <p className="text-lg sm:text-2xl font-bold text-yellow-600">12</p>
                  </div>
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Dentro do Limite</p>
                    <p className="text-lg sm:text-2xl font-bold text-orla-green">11</p>
                  </div>
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orla-green" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KRI Reports with Full Functionality */}
          <KRIReportsTabContent selectedProjectId={selectedProject?.id} />
        </div>
      </div>
    </div>
  );
};

export default KRIReportsPage;