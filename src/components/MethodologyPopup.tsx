
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Target, AlertTriangle, CheckCircle, BookOpen, Users } from "lucide-react";

interface MethodologyPopupProps {
  children: React.ReactNode;
}

const MethodologyPopup = ({ children }: MethodologyPopupProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Metodologia COSO / ISO 31000 / PMBOK
          </DialogTitle>
          <DialogDescription>
            Framework integrado de controle interno, gestão de riscos e gestão de projetos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="coso">COSO ERM</TabsTrigger>
            <TabsTrigger value="iso">ISO 31000</TabsTrigger>
            <TabsTrigger value="pmbok">PMBOK</TabsTrigger>
            <TabsTrigger value="implementation">Implementação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Framework Integrado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700">
                  Nossa plataforma integra as melhores práticas do <strong>COSO Enterprise Risk Management (ERM)</strong> 
                  com os princípios da <strong>ISO 31000</strong> e a metodologia <strong>PMBOK</strong>, proporcionando uma abordagem holística para 
                  gestão integrada de riscos, controles e projetos organizacionais.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2">COSO ERM 2017</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 5 Componentes integrados</li>
                      <li>• 20 Princípios fundamentais</li>
                      <li>• Foco na estratégia e performance</li>
                      <li>• Criação, preservação e realização de valor</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">ISO 31000:2018</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Princípios universais</li>
                      <li>• Estrutura (Framework)</li>
                      <li>• Processo sistemático</li>
                      <li>• Melhoria contínua</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 bg-orange-50">
                    <h4 className="font-semibold text-orange-800 mb-2">PMBOK 7ª Edição</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• 12 Princípios de gestão</li>
                      <li>• 8 Domínios de performance</li>
                      <li>• Abordagem value-driven</li>
                      <li>• Entrega contínua de valor</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefícios da Integração</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Alinhamento Estratégico</h4>
                    <p className="text-sm text-slate-600">Riscos alinhados aos objetivos organizacionais</p>
                  </div>
                  <div className="text-center p-4">
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Controles Eficazes</h4>
                    <p className="text-sm text-slate-600">Sistema robusto de controles internos</p>
                  </div>
                  <div className="text-center p-4">
                    <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold">Decisões Informadas</h4>
                    <p className="text-sm text-slate-600">Base sólida para tomada de decisões</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coso" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>COSO Enterprise Risk Management (ERM) 2017</CardTitle>
                <p className="text-slate-600">
                  Desenvolvido pelo Committee of Sponsoring Organizations of the Treadway Commission
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">5 Componentes Fundamentais:</h4>
                  
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-semibold text-blue-700">1. Governança e Cultura</h5>
                      <p className="text-sm text-slate-600">Estabelece o tom da organização, reforçando a importância e os valores da gestão de riscos corporativos</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-semibold text-green-700">2. Estratégia e Definição de Objetivos</h5>
                      <p className="text-sm text-slate-600">A gestão de riscos é considerada no planejamento estratégico e na definição de objetivos</p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h5 className="font-semibold text-yellow-700">3. Performance</h5>
                      <p className="text-sm text-slate-600">Identificação, avaliação e priorização de riscos que afetam a performance organizacional</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-semibold text-purple-700">4. Revisão e Revisão</h5>
                      <p className="text-sm text-slate-600">Avaliação da eficácia dos componentes da gestão de riscos corporativos</p>
                    </div>
                    
                    <div className="border-l-4 border-red-500 pl-4">
                      <h5 className="font-semibold text-red-700">5. Informação, Comunicação e Reporte</h5>
                      <p className="text-sm text-slate-600">Suporte à gestão de riscos através de comunicação contínua e compartilhamento de informações</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">20 Princípios COSO ERM</h4>
                  <p className="text-sm text-slate-600">
                    Cada componente é apoiado por princípios específicos que fornecem diretrizes claras 
                    para implementação e operação eficaz da gestão de riscos corporativos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iso" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ISO 31000:2018 - Gestão de Riscos</CardTitle>
                <p className="text-slate-600">
                  Padrão internacional que fornece diretrizes sobre gestão de riscos
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">11 Princípios da ISO 31000:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-semibold text-blue-700">1. Integrada</h5>
                      <p className="text-xs text-blue-600">Parte integral de todas as atividades organizacionais</p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-semibold text-green-700">2. Estruturada e Abrangente</h5>
                      <p className="text-xs text-green-600">Abordagem estruturada e abrangente</p>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-semibold text-yellow-700">3. Customizada</h5>
                      <p className="text-xs text-yellow-600">Adequada ao contexto organizacional</p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded">
                      <h5 className="font-semibold text-purple-700">4. Inclusiva</h5>
                      <p className="text-xs text-purple-600">Envolvimento apropriado das partes interessadas</p>
                    </div>
                    
                    <div className="bg-red-50 p-3 rounded">
                      <h5 className="font-semibold text-red-700">5. Dinâmica</h5>
                      <p className="text-xs text-red-600">Responde às mudanças de forma oportuna</p>
                    </div>
                    
                    <div className="bg-indigo-50 p-3 rounded">
                      <h5 className="font-semibold text-indigo-700">6. Melhor Informação Disponível</h5>
                      <p className="text-xs text-indigo-600">Baseada nas melhores informações disponíveis</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Processo de Gestão de Riscos:</h4>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Comunicação e Consulta</Badge>
                    <Badge className="bg-green-100 text-green-800">Estabelecimento do Contexto</Badge>
                    <Badge className="bg-yellow-100 text-yellow-800">Avaliação de Riscos</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Tratamento de Riscos</Badge>
                    <Badge className="bg-red-100 text-red-800">Monitoramento e Análise Crítica</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pmbok" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>PMBOK 7ª Edição - Project Management Body of Knowledge</CardTitle>
                <p className="text-slate-600">
                  Guia fundamental para gestão de projetos desenvolvido pelo Project Management Institute (PMI)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">12 Princípios de Gestão de Projetos:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-semibold text-orange-700">1. Steward Diligente</h5>
                      <p className="text-xs text-orange-600">Responsabilidade cuidadosa e respeitosa</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-semibold text-orange-700">2. Criar Ambientes Colaborativos</h5>
                      <p className="text-xs text-orange-600">Facilitar colaboração eficaz</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-semibold text-orange-700">3. Envolver Stakeholders</h5>
                      <p className="text-xs text-orange-600">Engajamento proativo das partes interessadas</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-semibold text-orange-700">4. Focar no Valor</h5>
                      <p className="text-xs text-orange-600">Concentrar-se na entrega de valor</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-semibold text-orange-700">5. Pensamento Sistêmico</h5>
                      <p className="text-xs text-orange-600">Reconhecer, avaliar e responder às interações</p>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <h5 className="font-semibold text-orange-700">6. Demonstrar Liderança</h5>
                      <p className="text-xs text-orange-600">Comportamentos de liderança em diferentes níveis</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">8 Domínios de Performance:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">1. Stakeholders</h5>
                      <p className="text-sm text-slate-600">Atividades relacionadas às partes interessadas</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">2. Time</h5>
                      <p className="text-sm text-slate-600">Atividades relacionadas à equipe</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">3. Abordagem de Desenvolvimento</h5>
                      <p className="text-sm text-slate-600">Métodos usados para criar entregas</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">4. Planejamento</h5>
                      <p className="text-sm text-slate-600">Atividades de organização e coordenação</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">5. Trabalho do Projeto</h5>
                      <p className="text-sm text-slate-600">Processos de estabelecimento e execução</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">6. Entrega</h5>
                      <p className="text-sm text-slate-600">Atividades que produzem saídas do projeto</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">7. Medição</h5>
                      <p className="text-sm text-slate-600">Atividades de avaliação e melhoria</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <h5 className="font-semibold text-orange-700">8. Incerteza</h5>
                      <p className="text-sm text-slate-600">Atividades relacionadas a riscos e incertezas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Destaques da 7ª Edição</h4>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li>• <strong>Mudança de Paradigma:</strong> Foco em princípios ao invés de processos rígidos</li>
                    <li>• <strong>Abordagem Value-Driven:</strong> Ênfase na entrega contínua de valor</li>
                    <li>• <strong>Flexibilidade:</strong> Adaptável a diferentes contextos e metodologias</li>
                    <li>• <strong>Integração Ágil:</strong> Incorpora princípios ágeis e híbridos</li>
                    <li>• <strong>Sistema de Entrega de Valor:</strong> Visão holística além do projeto individual</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Implementação na Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Como Aplicamos na Prática:</h4>
                  
                  <div className="space-y-3">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-semibold text-slate-800 mb-2">📊 Dashboard e KPIs</h5>
                      <p className="text-sm text-slate-600">
                        Monitoramento contínuo com indicadores alinhados aos objetivos estratégicos (COSO) 
                        e princípios de transparência (ISO 31000).
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-semibold text-slate-800 mb-2">🔗 Cadeia de Valor</h5>
                      <p className="text-sm text-slate-600">
                        Mapeamento de processos integrado à identificação de riscos, 
                        seguindo a abordagem estruturada da ISO 31000.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-semibold text-slate-800 mb-2">⚠️ Matriz de Riscos</h5>
                      <p className="text-sm text-slate-600">
                        Avaliação de probabilidade vs impacto, classificação por níveis 
                        e priorização conforme metodologia COSO ERM.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-semibold text-slate-800 mb-2">🛡️ Framework de Controles</h5>
                      <p className="text-sm text-slate-600">
                        Controles preventivos, detectivos e corretivos alinhados aos 
                        20 princípios COSO e processo sistemático ISO 31000.
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h5 className="font-semibold text-slate-800 mb-2">🎯 Planos de Melhoria</h5>
                      <p className="text-sm text-slate-600">
                        Ações de tratamento de riscos com foco na melhoria contínua 
                        e criação de valor organizacional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Certificações e Reconhecimentos</h4>
                  <p className="text-sm text-slate-600">
                    Metodologia baseada em frameworks reconhecidos globalmente por organizações como:
                    <strong> Big Four (Deloitte, PwC, KPMG, EY)</strong>, <strong>IIA (Institute of Internal Auditors)</strong>, 
                    <strong>ISACA</strong>, e <strong>ISO (International Organization for Standardization)</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MethodologyPopup;
