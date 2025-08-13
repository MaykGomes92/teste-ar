import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import WaveDivider from "@/components/ui/wave-divider";
import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";
import { 
  Building2, 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  UserPlus,
  ExternalLink,
  ArrowDown,
  Menu,
  ChevronRight,
  ChevronDown,
  Target,
  Users,
  Lightbulb,
  GitMerge,
  Facebook,
  Youtube,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  Mail,
  Phone
} from "lucide-react";

const Landing2 = () => {
  const scrollToContent = () => {
    const element = document.getElementById('main-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pillars = [
    {
      icon: TrendingUp,
      title: "Melhorar a Eficiência da Gestão",
      description: "Otimizamos processos e estruturas organizacionais para máxima performance"
    },
    {
      icon: DollarSign,
      title: "Reduzir Custos",
      description: "Identificamos oportunidades de economia e implementamos soluções sustentáveis"
    },
    {
      icon: AlertTriangle,
      title: "Minimizar Riscos",
      description: "Desenvolvemos estratégias robustas de gestão e mitigação de riscos"
    }
  ];

  const tabsData = {
    "orla-consultoria": {
      title: "Orla Consultoria",
      description: "Em todos os nossos projetos nosso foco é o entendimento do Planejamento Estratégico para alcançar Excelência em Processos e Performance, fundamentais para as transformações no seu negócio, garantindo a expansão, potencializando a eficiência e minimizando riscos.",
      sections: [
        {
          icon: Target,
          title: "Eficiência e Rentabilidade",
          items: [
            "Processos (Centro de Serviços Compartilhados, Backoffice, Centro de Excelência)",
            "Suprimentos e Logística - Strategic Sourcing, Transformação Digitalização, Estudos Categoria e Logística",
            "Gestão de Performance",
            "CRM, Vendas, Faturamento"
          ]
        },
        {
          icon: GitMerge,
          title: "Fusões e Aquisições",
          items: [
            "Planejamento da Integração - Toolkit",
            "Estudos de Sinergia Operacional, identificação de novas sinergias de gestão de gastos",
            "Gestão da Mudança",
            "Pós M&A"
          ]
        },
        {
          icon: Users,
          title: "Governança, Gente e Gestão",
          items: [
            "Reestruturação Organizacional",
            "Planejamento Sucessório e Desenvolvimento de Lideranças",
            "Implantação de Modelos de Avaliação de Performance",
            "Gestão de Cultura e Clima Organizacional",
            "Implantação de Modelos de Governança Corporativa",
            "Gestão da Mudança",
            "Transformação organizacional",
            "Cultura e engajamento"
          ]
        },
        {
          icon: Lightbulb,
          title: "Inovação",
          items: [
            "Estratégia Digital & AI",
            "Programas de Transformação",
            "Gestão de Equipes de Produto e Tecnologia",
            "Eficiência em TI & FinOps",
            "Governança & Gestão de Tecnologia",
            "Automações"
          ]
        }
      ],
      hasImage: false,
      imageUrl: ""
    },
    "instituto-onda": {
      title: "Instituto Onda",
      description: "Iniciativa focada no desenvolvimento de pequenas e médias empresas através de diagnósticos especializados e consultoria técnica.",
      sections: [
        {
          icon: Users,
          title: "Diagnóstico Empresarial", 
          items: [
            "Avaliação de maturidade organizacional",
            "Análise de processos e performance",
            "Identificação de oportunidades de melhoria"
          ]
        },
        {
          icon: Lightbulb,
          title: "Capacitação e Mentoria",
          items: [
            "Programas de desenvolvimento",
            "Mentoria executiva", 
            "Capacitação técnica especializada"
          ]
        }
      ],
      hasImage: true,
      imageUrl: "/lovable-uploads/f0d78a26-cf24-4f69-978d-417faef9b48b.png"
    },
    "parceiros": {
      title: "Parceiros",
      description: "Buscando entregar a excelência nos projetos, identificamos as melhores soluções e parceiros de mercado para atender as necessidades de nossos clientes.",
      sections: [
        {
          icon: Target,
          title: "Soluções Tecnológicas",
          items: [
            "CoPilot/Azure Segurança e IA",
            "Soluções de Automação & IA",
            "Automatização Folha",
            "Soluções Financeiras"
          ]
        },
        {
          icon: Users,
          title: "Serviços Especializados",
          items: [
            "Marketing/CRM",
            "Suprimentos & Supply Chain",
            "Treinamento",
            "Inovação",
            "Cultura e Pessoas"
          ]
        }
      ],
      hasImage: false,
      imageUrl: ""
    },
    "csr-esg": {
      title: "CSR & ESG",
      description: "Compromisso com a responsabilidade social corporativa e práticas sustentáveis de governança ambiental, social e corporativa.",
      sections: [
        {
          icon: Target,
          title: "Instituto da Criança",
          description: "Um gestor social que promove a conexão entre empresas e pessoas a projetos sociais. Desenvolvem ações que fazem a diferença no mundo ao nosso redor com o propósito de inspirar a solidariedade, gerar impacto positivo e promover a transformação social, fortalecendo o terceiro setor e capacitando projetos sociais. Trabalham para criar um mundo onde todas as pessoas tenham acesso à educação, saúde e amor, construindo um futuro mais justo e inclusivo para as próximas gerações.",
          items: [
            "Desenvolvimento integral de crianças e adolescentes",
            "Programas educacionais e de capacitação",
            "Proteção e promoção dos direitos da criança",
            "Parcerias com comunidades locais"
          ],
          website: "https://www.institutodacrianca.org.br"
        },
        {
          icon: Users,
          title: "Instituto Mar Urbano",
          description: "O Instituto Mar Urbano é uma organização não governamental que trabalha com o propósito de gerar e compartilhar conhecimento sobre o ambiente marinho, com foco no bem-estar humano e nos recursos naturais de que a vida depende. Acreditam que \"não se preserva aquilo que não se conhece\" e, portanto, buscam não apenas levar o que sabemos às pessoas, mas também estimular novas formas de pensar e agir.",
          items: [
            "Conservação de ecossistemas marinhos urbanos",
            "Educação ambiental e sustentabilidade",
            "Pesquisa e monitoramento marinho",
            "Programas de conscientização comunitária"
          ],
          website: "https://institutomarurbano.com.br/"
        }
      ],
      hasImage: false,
      imageUrl: ""
    }
  };

  return (
    <div className="min-h-screen">
      <GlobalHeader />

      {/* Hero Section - Fullscreen */}
      <section className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary-dark overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <div className="space-y-8">
            {/* Badge removido conforme solicitado */}
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transformação através de
              <br />
              <span className="text-white/90">Inteligência Humana</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto">
              Empresa de consultoria com sólida experiência técnica, focada na customização de soluções que impulsionam a excelência, ampliam a eficiência e reduzem riscos, contribuindo para a expansão sustentável dos negócios.
            </p>
            
            {/* CTA Button removido conforme solicitado */}
            
            {/* Quote */}
            <div className="pt-12">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm max-w-4xl mx-auto">
                <CardContent className="p-8 text-center">
                  <blockquote className="text-xl italic text-white/95 mb-4">
                    "Em tempos de inteligência artificial, queremos falar com você de inteligência humana e conhecimento técnico prático"
                  </blockquote>
                  <cite className="text-sm font-semibold text-white/80">
                    Flávio Vieira, Diretor Independentes do Board
                  </cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white cursor-pointer" onClick={scrollToContent}>
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-sm">Scroll para saber mais</span>
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div id="main-content">
        {/* Objectives Section */}
        <section id="quem-somos" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Nosso objetivo é ajudar as empresas em:
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Somos uma consultoria criada por quem esteve na linha de frente da gestão. Unimos método, estratégia e execução para desenhar soluções sob medida, com foco no que move o negócio e gera impacto real.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pillars.map((pillar, index) => (
                <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                      <pillar.icon className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-lg text-gray-600 leading-relaxed">
                      {pillar.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Wave Divider */}
        <WaveDivider className="h-16 md:h-20" />

        {/* Services Section with Tabs */}
        <section id="servicos" className="py-20 px-6 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Nossos Serviços
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Soluções completas para transformar seu negócio, garantindo expansão, potencializando eficiência e minimizando riscos.
              </p>
            </div>

            <Tabs defaultValue="orla-consultoria" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-12">
                <TabsTrigger value="orla-consultoria">Orla Consultoria</TabsTrigger>
                <TabsTrigger value="instituto-onda">Instituto Onda</TabsTrigger>
                <TabsTrigger value="parceiros">Parceiros</TabsTrigger>
                <TabsTrigger value="csr-esg">CSR & ESG</TabsTrigger>
              </TabsList>

              {Object.entries(tabsData).map(([key, tab]) => (
                <TabsContent key={key} value={key} className="mt-8">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{tab.title}</h3>
                    <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                      {tab.description}
                    </p>
                  </div>

                  {/* Imagem para Instituto Onda */}
                  {tab.hasImage && (
                    <div className="flex justify-center mb-12">
                      <div className="bg-transparent p-8 rounded-lg">
                        <img 
                          src={tab.imageUrl} 
                          alt={`Diagrama ${tab.title}`}
                          className="max-w-full h-auto object-contain"
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Imagem adicional para Instituto Onda */}
                  {key === "instituto-onda" && (
                    <div className="flex justify-center mb-12">
                      <div className="bg-transparent p-8 rounded-lg">
                        <img 
                          src="/lovable-uploads/2851ea82-1137-41f4-9c50-102e5cbd22a8.png" 
                          alt="Estrutura de desenvolvimento empresarial"
                          className="max-w-full h-auto object-contain"
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`grid gap-8 ${key === "orla-consultoria" ? "md:grid-cols-4" : "md:grid-cols-2"}`}>
                    {tab.sections.map((section, index) => (
                      <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden h-full">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col items-center text-center mb-4">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-3">
                              <section.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <CardTitle className="text-xl font-bold text-gray-900 leading-tight">{section.title}</CardTitle>
                              {section.website && (
                                <a 
                                  href={section.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-primary hover:text-accent transition-colors"
                                  title={`Visitar ${section.title}`}
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {section.description && (
                            <div className="mb-6">
                              <p className="text-sm text-gray-600 leading-relaxed">{section.description}</p>
                            </div>
                          )}
                          
                          <ul className="space-y-3">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-3">
                                <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                          
                          {key === "orla-consultoria" && section.title === "Eficiência e Rentabilidade" && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <a 
                                href="https://maturidade-de-processos.lovable.app" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium group"
                              >
                                Acesse nossa Avaliação de Maturidade de Processos
                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </a>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contato" className="py-20 px-6 bg-gradient-to-br from-primary via-accent to-primary-dark text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para Transformar seu Negócio?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Entre em contato conosco e descubra como podemos ajudar sua empresa a alcançar novos patamares de excelência.
            </p>
            
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold"
                onClick={() => {
                  const recipients = "guilherme.carvalho@orlaconsultoria.com.br,tatianarangel@orlaconsultoria.com.br";
                  const subject = "Solicitação de Contato - Orla Consultoria";
                  const body = "Olá,%0D%0A%0D%0AGostaria de saber mais sobre as soluções da Orla Consultoria.%0D%0A%0D%0APor favor, entrem em contato para agendarmos uma conversa.%0D%0A%0D%0AObrigado!";
                  window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
                }}
              >
                Agendar Conversa
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        <GlobalFooter />
      </div>
    </div>
  );
};

export default Landing2;