import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Target, TrendingUp, Shield, Users, FileText, Lightbulb, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const LandingDiagnostico = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    area: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    // Salvar dados no localStorage para futura consulta do CRM
    const existingData = JSON.parse(localStorage.getItem('orla-crm-leads') || '[]');
    const newLead = {
      ...formData,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    existingData.push(newLead);
    localStorage.setItem('orla-crm-leads', JSON.stringify(existingData));
    
    // Criar texto para o email
    const emailBody = `
Olá!

Gostaria de solicitar um Diagnóstico de Maturidade para nossa empresa.

DADOS:
• Nome: ${formData.name}
• Empresa: ${formData.company}
• Cargo: ${formData.position}
• E-mail: ${formData.email}
• Telefone: ${formData.phone}
• Área de Interesse: ${formData.area}

${formData.message ? `MENSAGEM:\n${formData.message}\n` : ''}
Aguardo contato para conversarmos sobre o diagnóstico.

Obrigado(a),
${formData.name}
    `.trim();
    
    const mailtoLink = `mailto:guilherme.carvalho@orlaconsultoria.com.br,tatianarangel@orlaconsultoria.com.br?subject=Solicitação de Diagnóstico de Maturidade&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
    
    toast({
      title: "Formulário enviado!",
      description: "Seus dados foram salvos e o email foi aberto para envio.",
    });
    
    // Limpar formulário
    setFormData({
      name: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      area: '',
      message: ''
    });
  };

  const createMailtoLink = () => {
    return "mailto:guilherme.carvalho@orlaconsultoria.com.br,tatianarangel@orlaconsultoria.com.br?subject=Solicitação de Diagnóstico";
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed CTA Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button className="shadow-lg" asChild>
          <a href={createMailtoLink()}>
            Solicitar Diagnóstico
          </a>
        </Button>
      </div>

      {/* Header Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra o grau de maturidade da gestão de processos da sua empresa
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
            Diagnósticos executivos para acelerar a eficiência, reduzir riscos e transformar processos com foco no que realmente importa
          </p>
        </div>
      </section>

      {/* Authority Block */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Orla Consultoria</h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            "Somos uma consultoria criada por quem esteve na linha de frente da gestão. Unimos método, estratégia e execução para gerar impacto real."
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-teal-box text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Processos</h3>
              <p className="text-sm opacity-90">Centro de serviços compartilhados, backoffice, centro de excelência</p>
            </div>
            <div className="bg-teal-box text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Suprimentos e logística</h3>
              <p className="text-sm opacity-90">Strategic sourcing, transformação digitalização, estudos categoria e logística</p>
            </div>
            <div className="bg-teal-box text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Planejamento estratégico</h3>
              <p className="text-sm opacity-90">Gestão de performance</p>
            </div>
            <div className="bg-teal-box text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">CRM, vendas</h3>
              <p className="text-sm opacity-90">Faturamento</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Benefícios do diagnóstico de maturidade
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-secondary/20 shadow-lg">
              <CardHeader>
                <Target className="h-12 w-12 mx-auto text-secondary mb-4" />
                <CardTitle className="text-lg">Mapeamento completo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Identificação precisa de gaps e oportunidades de melhoria nos seus processos
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary/20 shadow-lg">
              <CardHeader>
                <TrendingUp className="h-12 w-12 mx-auto text-secondary mb-4" />
                <CardTitle className="text-lg">Gestão de gastos, redução de custos e eliminação de desperdícios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Eliminação de desperdícios e otimização de recursos através de processos eficientes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary/20 shadow-lg">
              <CardHeader>
                <Lightbulb className="h-12 w-12 mx-auto text-secondary mb-4" />
                <CardTitle className="text-lg">Automação & AI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Aplicação estratégica de automação e inteligência artificial para alavancar resultados
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-secondary/20 shadow-lg">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-secondary mb-4" />
                <CardTitle className="text-lg">Mitigação de riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Identificação e controle de riscos com foco em melhoria contínua
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Flow Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Como funciona nosso diagnóstico
          </h2>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Aplicação do Diagnóstico",
                description: "Formulários estruturados, entrevistas com stakeholders e análise documental detalhada"
              },
              {
                step: "02", 
                title: "Análise com Especialistas + Cliente",
                description: "Imersão collaborative e validação dos achados com sua equipe"
              },
              {
                step: "03",
                title: "Apresentação do Mapa de Maturidade", 
                description: "Visualização clara do estado atual e gaps identificados"
              },
              {
                step: "04",
                title: "Co-criação de Roadmap Estratégico",
                description: "Visão multi-year com quick wins e iniciativas estruturantes"
              },
              {
                step: "05",
                title: "Entrega do Plano de Ação Personalizado",
                description: "Roteiro detalhado e priorizado para transformação dos seus processos"
              }
            ].map((item, index) => (
              <Card key={index} className="border-t-4 border-t-secondary shadow-lg text-center h-full">
                <CardContent className="flex flex-col items-center gap-4 p-6">
                  <div className="bg-secondary text-secondary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Quer entender como está a maturidade da sua empresa?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Agende uma conversa com nossos especialistas e descubra como transformar seus processos
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Solicite seu Diagnóstico</CardTitle>
              <CardDescription>
                Preencha o formulário e entraremos em contato em até 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input 
                    id="company" 
                    placeholder="Nome da empresa" 
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Cargo</Label>
                  <Input 
                    id="position" 
                    placeholder="Seu cargo" 
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(00) 00000-0000" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área de Interesse</Label>
                  <Input 
                    id="area" 
                    placeholder="Área ou processo específico" 
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea 
                  id="message" 
                  placeholder="Conte-nos mais sobre seu desafio..." 
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>
              
              <Button className="w-full" size="lg" onClick={handleSubmit}>
                Solicitar Diagnóstico
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            O que nossos clientes dizem
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  "O diagnóstico da Orla foi fundamental para identificarmos gargalos que não víamos. Em 6 meses, reduzimos 30% do tempo de nossos processos principais."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Ana Silva</p>
                    <p className="text-sm text-muted-foreground">Diretora de Operações</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  "Metodologia consistente e resultados práticos. O roadmap criado nos guiou perfeitamente na implementação das melhorias."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Carlos Mendes</p>
                    <p className="text-sm text-muted-foreground">CEO</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  "Profissionalismo e expertise incomparáveis. O diagnóstico trouxe clareza sobre nossos próximos passos estratégicos."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Marina Costa</p>
                    <p className="text-sm text-muted-foreground">Gerente de Processos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Orla Consultoria</h3>
              <p className="text-primary-foreground/80">
                Transformando processos com método, estratégia e execução para gerar impacto real.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Diagnóstico de Maturidade</li>
                <li>Consultoria em Processos</li>
                <li>Implementação de Melhorias</li>
                <li>Treinamentos Corporativos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Áreas de Atuação</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Processos e Centro de Excelência</li>
                <li>Suprimentos e Logística</li>
                <li>Planejamento Estratégico</li>
                <li>CRM e Vendas</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-3 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@orlaconsultoria.com.br</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 Orla Consultoria. Todos os direitos reservados.</p>
            <p className="mt-2">
              <a href="#" className="hover:text-primary-foreground">Política de Privacidade</a> | 
              <a href="#" className="hover:text-primary-foreground ml-2">Termos de Uso</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingDiagnostico;