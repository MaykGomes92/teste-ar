import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Building, Target, Eye, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const COSOIntegratedFramework = () => {
  const cosoComponents = [
    {
      id: 'environment',
      title: 'Ambiente de Controle',
      description: 'Base para todos os outros componentes de controle interno',
      icon: Building,
      color: 'bg-blue-500',
      borderColor: 'border-blue-200',
      items: [
        'Integridade e valores éticos',
        'Filosofia e estilo operacional',
        'Estrutura organizacional',
        'Políticas de recursos humanos'
      ],
      status: 'Em desenvolvimento',
      progress: 75
    },
    {
      id: 'assessment',
      title: 'Avaliação de Riscos',
      description: 'Identificação e análise de riscos relevantes',
      icon: Target,
      color: 'bg-red-500',
      borderColor: 'border-red-200',
      items: [
        'Definição de objetivos',
        'Identificação de riscos',
        'Análise de riscos',
        'Gerenciamento de mudanças'
      ],
      status: 'Ativo',
      progress: 85
    },
    {
      id: 'activities',
      title: 'Atividades de Controle',
      description: 'Políticas e procedimentos que asseguram o cumprimento das diretrizes',
      icon: Shield,
      color: 'bg-green-500',
      borderColor: 'border-green-200',
      items: [
        'Políticas e procedimentos',
        'Controles de aplicação',
        'Segregação de funções',
        'Controles físicos'
      ],
      status: 'Ativo',
      progress: 90
    },
    {
      id: 'information',
      title: 'Informação e Comunicação',
      description: 'Sistemas que suportam a identificação, captura e troca de informações',
      icon: Eye,
      color: 'bg-purple-500',
      borderColor: 'border-purple-200',
      items: [
        'Qualidade da informação',
        'Comunicação interna',
        'Comunicação externa',
        'Sistemas de informação'
      ],
      status: 'Em desenvolvimento',
      progress: 60
    },
    {
      id: 'monitoring',
      title: 'Monitoramento',
      description: 'Avaliação da qualidade do desempenho dos controles internos',
      icon: BarChart3,
      color: 'bg-orange-500',
      borderColor: 'border-orange-200',
      items: [
        'Avaliações contínuas',
        'Avaliações independentes',
        'Comunicação de deficiências',
        'Melhorias contínuas'
      ],
      status: 'Em desenvolvimento',
      progress: 45
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-green-100 text-green-800 border-green-200";
      case "Em desenvolvimento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Planejado": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-6 h-6 text-primary" />
          Framework COSO - Controles Internos
        </CardTitle>
        <p className="text-muted-foreground">
          Navegue pelos 5 componentes fundamentais do framework COSO para controles internos efetivos
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {cosoComponents.map((component) => {
            const IconComponent = component.icon;
            return (
              <Card key={component.id} className={`${component.borderColor} border-2 hover:shadow-md transition-all duration-200`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`${component.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">{component.title}</h4>
                        <Badge className={getStatusColor(component.status)}>
                          {component.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {component.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{component.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${getProgressColor(component.progress)} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${component.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Items List */}
                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {component.items.map((item, index) => (
                          <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 bg-current rounded-full flex-shrink-0"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Framework baseado no COSO (Committee of Sponsoring Organizations)
            </div>
            <div className="flex gap-2">
              <Link to="/grc-nextgen-suite">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Framework GRC
                </Button>
              </Link>
              <Link to="/processo-management">
                <Button size="sm">
                  Acessar Controles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default COSOIntegratedFramework;