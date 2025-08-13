import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  ArrowRight,
  Building2,
  FileText,
  Eye,
  Shield,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";

const GRCFramework = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Framework Completo de GRC
        </h2>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-4">
          Programa integrado de Governança, Riscos e Compliance baseado em metodologias 
          reconhecidas internacionalmente (COSO, ISO 31000, ISO 37301)
        </p>
        
        
        {/* Call to Action - Link para página dedicada */}
        <Link to="/grc-nextgen-suite">
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 text-lg">
            <Target className="w-5 h-5 mr-2" />
            Explorar Framework Completo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Preview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Estrutura Base Preview */}
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Estrutura Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Cadeia de Valor → Processos → Riscos → Controles com referências automáticas
            </p>
            <Link to="/cadastro">
              <Button variant="outline" className="w-full">
                Acessar Cadastros
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Mapeamento Preview */}
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Mapeamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Projeto completo de mapeamento de processos e controles internos
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full">
                Entrar no Sistema
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Auditoria Preview */}
        <Card className="border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-green-600" />
              Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Cronograma de auditoria, testes de efetividade e planos de ação
            </p>
            <Link to="/grc-nextgen-auditoria">
              <Button variant="outline" className="w-full">
                Módulo Auditoria
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Metodologias */}
      <Card className="bg-gradient-to-r from-gray-50 to-white border-gray-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <h3 className="text-xl font-bold text-center">Metodologias e Frameworks Suportados</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                  <Info className="w-4 h-4 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Metodologias e Frameworks de GRC</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="coso">COSO</TabsTrigger>
                    <TabsTrigger value="iso31000">ISO 31000</TabsTrigger>
                    <TabsTrigger value="iso37301">ISO 37301</TabsTrigger>
                    <TabsTrigger value="cobit">COBIT</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <h3 className="text-lg font-semibold">Framework Integrado de GRC</h3>
                    <p className="text-muted-foreground">
                      Nosso framework combina as melhores práticas das principais metodologias internacionais 
                      para criar uma abordagem integrada de Governança, Riscos e Compliance.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Benefícios da Integração</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Visão holística dos riscos organizacionais</li>
                          <li>• Redução de redundâncias e silos</li>
                          <li>• Melhoria na tomada de decisões</li>
                          <li>• Otimização de recursos e custos</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Aplicação Prática</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Mapeamento de processos e controles</li>
                          <li>• Avaliação e monitoramento de riscos</li>
                          <li>• Auditoria e testes de efetividade</li>
                          <li>• Planos de ação e melhoria contínua</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="coso" className="space-y-4">
                    <h3 className="text-lg font-semibold">COSO - Committee of Sponsoring Organizations</h3>
                    <p className="text-muted-foreground">
                      Framework líder mundial para Enterprise Risk Management (ERM) e controles internos.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Cinco Componentes do COSO</h4>
                        <div className="grid gap-2">
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">1. Ambiente de Controle</h5>
                            <p className="text-sm text-muted-foreground">Cultura organizacional e tom da liderança</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">2. Avaliação de Riscos</h5>
                            <p className="text-sm text-muted-foreground">Identificação e análise de riscos aos objetivos</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">3. Atividades de Controle</h5>
                            <p className="text-sm text-muted-foreground">Políticas e procedimentos para mitigar riscos</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">4. Informação e Comunicação</h5>
                            <p className="text-sm text-muted-foreground">Captura e comunicação de informações relevantes</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">5. Monitoramento</h5>
                            <p className="text-sm text-muted-foreground">Avaliação contínua da efetividade dos controles</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="iso31000" className="space-y-4">
                    <h3 className="text-lg font-semibold">ISO 31000 - Gestão de Riscos</h3>
                    <p className="text-muted-foreground">
                      Padrão internacional que fornece princípios e diretrizes para gestão de riscos.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Princípios da ISO 31000</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Criar e Proteger Valor</h5>
                            <p className="text-sm text-muted-foreground">A gestão de riscos deve agregar valor à organização</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Integrada</h5>
                            <p className="text-sm text-muted-foreground">Parte integral de todos os processos organizacionais</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Estruturada e Abrangente</h5>
                            <p className="text-sm text-muted-foreground">Abordagem sistemática e consistente</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Customizada</h5>
                            <p className="text-sm text-muted-foreground">Alinhada ao contexto da organização</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Processo de Gestão de Riscos</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Comunicação → Estabelecimento do Contexto → Identificação → Análise → 
                            Avaliação → Tratamento → Monitoramento e Análise Crítica
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="iso37301" className="space-y-4">
                    <h3 className="text-lg font-semibold">ISO 37301 - Sistemas de Gestão de Compliance</h3>
                    <p className="text-muted-foreground">
                      Padrão internacional para sistemas de gestão de compliance organizacional.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Elementos Principais</h4>
                        <div className="grid gap-2">
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Contexto da Organização</h5>
                            <p className="text-sm text-muted-foreground">Compreensão do ambiente interno e externo</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Liderança e Compromisso</h5>
                            <p className="text-sm text-muted-foreground">Demonstração do comprometimento da alta direção</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Planejamento</h5>
                            <p className="text-sm text-muted-foreground">Identificação de obrigações e riscos de compliance</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Operação</h5>
                            <p className="text-sm text-muted-foreground">Implementação de controles e processos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cobit" className="space-y-4">
                    <h3 className="text-lg font-semibold">COBIT - Control Objectives for IT</h3>
                    <p className="text-muted-foreground">
                      Framework para governança e gestão de TI empresarial.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Domínios do COBIT</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Planejar e Organizar (PO)</h5>
                            <p className="text-sm text-muted-foreground">Estratégia de TI e arquitetura</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Adquirir e Implementar (AI)</h5>
                            <p className="text-sm text-muted-foreground">Soluções de TI e integração</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Entregar e Suportar (DS)</h5>
                            <p className="text-sm text-muted-foreground">Serviços e suporte aos usuários</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <h5 className="font-medium">Monitorar e Avaliar (ME)</h5>
                            <p className="text-sm text-muted-foreground">Desempenho e compliance</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <h4 className="font-bold text-sm text-gray-900">COSO</h4>
              <p className="text-xs text-gray-600">Enterprise Risk Management</p>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-sm text-gray-900">ISO 31000</h4>
              <p className="text-xs text-gray-600">Risk Management</p>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-sm text-gray-900">ISO 37301</h4>
              <p className="text-xs text-gray-600">Compliance Management</p>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-sm text-gray-900">COBIT</h4>
              <p className="text-xs text-gray-600">IT Governance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GRCFramework;