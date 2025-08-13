
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import MethodologyPopup from "@/components/MethodologyPopup";
import GRCFramework from "@/components/GRCFramework";
import { 
  Building2, 
  Shield, 
  BarChart3, 
  FileText, 
  Users, 
  Settings,
  CheckCircle,
  ArrowRight,
  Star,
  BookOpen,
  UserPlus,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Target,
  Award,
  Clock,
  ExternalLink
} from "lucide-react";

const LandingPage = () => {
  const pillars = [
    {
      icon: TrendingUp,
      title: "Melhorar a Eficiência da Gestão",
      description: "Otimizamos processos e estruturas organizacionais para máxima performance",
      color: "from-green-700 to-green-800"
    },
    {
      icon: DollarSign,
      title: "Reduzir Custos",
      description: "Identificamos oportunidades de economia e implementamos soluções sustentáveis",
      color: "from-green-700 to-green-800"
    },
    {
      icon: AlertTriangle,
      title: "Minimizar Riscos",
      description: "Desenvolvemos estratégias robustas de gestão e mitigação de riscos",
      color: "from-green-700 to-green-800"
    }
  ];

  const solutions = [
    {
      icon: Building2,
      title: "Sistema de Gestão de Processos",
      description: "Plataforma completa para mapeamento de processos, controle de riscos e governança corporativa",
      features: ["Mapeamento de Processos", "Gestão de Riscos", "Controles Internos", "Dashboard Executivo"],
      link: "/auth"
    }
  ];

  // Dados dos sócios principais
  const teamMembers = [
    {
      nome: "Guilherme Carvalho",
      cargo: "Sócio Diretor",
      resumo: "Profissional multidisciplinar com mais de 25 anos de experiência, especialista em Suprimentos e Gestão de Gastos, Transformação e Gestão de Mudanças, focado em resultados e com alta capacidade de entrega.",
      texto: "Executivo de empresas globais com especialização no MIT, atuação em startups, consultorias com experiência em Planejamento Estratégico, Criação e Transformação de Negócios, Implantação de CSC globais em mais de 15 países, Estabelecimento e Melhoria de Processos, Cadeia de Suprimentos, Gestão de Custos e Gastos, Gestão de Performance, Integração e Reestruturação de Empresas, Implantação de Centro de Excelência, Serviços compartilhados e BPO's."
    },
    {
      nome: "Tatiana Rangel",
      cargo: "Sócia Diretora",
      resumo: "Profissional com mais de 20 anos de experiência em Processos, reconhecida por atuar em projetos de grandes transformações, com excelência em integrações de empresas Pós-fusão e Aquisição.",
      texto: "Atuação como consultora de processos na Deloitte e TOTVS, além de sócia da consultoria Ekons. Possui vasta experiência em projetos nos setores de Educação, Petróleo & Gás, Mineração, Transporte e Entretenimento. Liderança em frentes estratégicas dos projetos de integração de novas aquisições e de capital no CSC da Vale, em nível global. Atuou como Head de CSC e Gestão de Serviços em grandes empresas, como a Estácio."
    }
  ];

  const handleScheduleDemo = () => {
    const recipients = "guilherme.carvalho@orlaconsultoria.com.br,tatianarangel@orlaconsultoria.com.br";
    const subject = "Solicitação de Contato - Orla Consultoria";
    const body = "Olá,%0D%0A%0D%0AGostaria de saber mais sobre as soluções da Orla Consultoria.%0D%0A%0D%0APor favor, entrem em contato para agendarmos uma conversa.%0D%0A%0D%0AObrigado!";
    
    window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <LogoWithoutBackground className="h-16 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cadastro">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
                title="Cadastro - Acesso restrito a administradores"
              >
                <UserPlus className="w-4 h-4" />
                Cadastro
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-accent">
                Login Sistema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Orla
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Consultoria</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-6 max-w-4xl mx-auto font-medium">
            Empresa de consultoria com sólida experiência técnica, focada na customização de soluções que impulsionam a excelência, ampliam a eficiência e reduzem riscos, contribuindo para a expansão sustentável dos negócios.
          </p>
          
          <div className="max-w-4xl mx-auto mb-4">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-6 text-center">
                <blockquote className="text-lg italic text-gray-700 mb-4">
                  "Em tempos de inteligência artificial, queremos falar com você de inteligência humana e conhecimento técnico prático"
                </blockquote>
                <cite className="text-sm font-semibold text-primary">
                  Flávio Vieira, Diretor Independentes do Board
                </cite>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nosso Objetivo é Ajudar as Empresas em:
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg`}>
                    <pillar.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Grupo Oceano Section */}
      <section className="py-10 bg-white">
        <div className="w-full">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 rounded-none">
            <CardContent className="px-6 py-8 text-center max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Grupo Oceano
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed italic">
                O Grupo Oceano é onde a inteligência humana, a tecnologia e o compromisso com o impacto real convergem para transformar negócios. Somos um ecossistema de soluções que mergulha fundo no diagnóstico e na construção de caminhos sob medida para empresas de qualquer porte, com visão estratégica, execução afiada e responsabilidade ética.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="grc-framework" className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8">
              <TabsTrigger value="grc-framework" className="text-sm">GRC Framework</TabsTrigger>
              <TabsTrigger value="orla-consultoria" className="text-sm">Orla Consultoria</TabsTrigger>
              <TabsTrigger value="instituto-onda" className="text-sm">Instituto Onda</TabsTrigger>
              <TabsTrigger value="parceiros" className="text-sm">Parceiros</TabsTrigger>
              <TabsTrigger value="csr-esg" className="text-sm">CSR & ESG</TabsTrigger>
              <TabsTrigger value="quem-somos" className="text-sm">Quem Somos</TabsTrigger>
              <TabsTrigger value="solucoes" className="text-sm">Soluções</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grc-framework" className="space-y-8">
              <GRCFramework />
            </TabsContent>
            
            <TabsContent value="orla-consultoria" className="space-y-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Orla Consultoria</h3>
                <p className="text-lg text-gray-600">
                  Em todos os nossos projetos nosso foco é o entendimento do Planejamento Estratégico para alcançar Excelência em Processos e Performance, fundamentais para as transformações no seu negócio, garantindo a expansão, potencializando a eficiência e minimizando riscos.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Eficiência e Rentabilidade */}
                <Card className="p-8">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-primary">Eficiência e Rentabilidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">• Processos</h4>
                        <p className="text-gray-600 text-sm ml-4">CSC; Backoffice, Centro de Excelência</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">• Suprimentos e Logística</h4>
                        <p className="text-gray-600 text-sm ml-4">Strategic Sourcing, Transformação Digitalização, Estudos Categoria e Logística</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Planejamento Estratégico</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Gestão de Performance</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• CRM, Vendas, Faturamento</h4>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <a 
                        href="https://maturidade-de-processos.lovable.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                      >
                        Acesse nossa Avaliação de Maturidade de Processos
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Post Merger Integration */}
                <Card className="p-8">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-primary">Post Merger Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">• Pós M&A</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Planejamento da Integração - Toolkit</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">• Estudos de Sinergia Operacional</h4>
                        <p className="text-gray-600 text-sm ml-4">Identificação de novas sinergias de gestão de gastos</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Gestão da Mudança</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Governança, Gestão e Gente */}
                <Card className="p-8">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-primary">Governança, Gestão e Gente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">• Reestruturação Organizacional</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Planejamento Sucessório e Desenvolvimento de Lideranças</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Implantação de Modelos de Avaliação de Performance</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Gestão de Cultura e Clima Organizacional</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Implantação de Modelos de Governança Corporativa</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inovação */}
                <Card className="p-8">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-primary">Inovação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">• Automações</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Estratégia Digital & AI</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Programas de Transformação</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Gestão de Equipes de Produto e Tecnologia</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Eficiência em TI & FinOps</h4>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">• Governança & Gestão de Tecnologia</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="instituto-onda" className="space-y-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Instituto Onda</h3>
                <p className="text-xl text-gray-600">
                  Educação e Desenvolvimento
                </p>
              </div>
              <Card className="p-8">
                <CardContent className="space-y-8">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    O Instituto Onda auxilia a identificar, nas empresas, as suas fragilidades, nas principais competências de gestão, e fornecer uma gama de soluções para evolução da maturidade empresaria
                  </p>
                  
                  {/* Imagem do gráfico de processos */}
                  <div className="flex justify-center">
                    <img 
                      src="/lovable-uploads/53f70fac-5a7e-4054-a4eb-8714680a0854.png" 
                      alt="Gráfico de Gestão por Processos"
                      className="w-full max-w-4xl h-auto rounded-lg shadow-md"
                    />
                  </div>
                  
                  {/* Imagem dos níveis de maturidade */}
                  <div className="flex justify-center">
                    <img 
                      src="/lovable-uploads/cc7b88ca-e68a-42e3-8b18-2c34bf617584.png" 
                      alt="Níveis de Maturidade Empresarial"
                      className="w-full max-w-4xl h-auto rounded-lg shadow-md"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parceiros" className="space-y-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Parceiros</h3>
                <p className="text-xl text-gray-600">
                  Nossa Rede de Colaboradores
                </p>
              </div>
              <Card className="p-8">
                <CardContent>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Buscando entregar a excelências nos projetos, identificamos as melhores soluções e parceiros de mercado para atender as necessidades de nossos clientes.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="csr-esg" className="space-y-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">CSR & ESG</h3>
                <p className="text-xl text-gray-600">
                  Responsabilidade Social e Governança
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Instituto da Criança */}
                <Card className="p-8">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <CardTitle className="text-xl font-bold text-primary">Instituto da Criança</CardTitle>
                      <a 
                        href="https://institutodacrianca.org.br" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Um gestor social que promove a conexão entre empresas e pessoas a projetos sociais. Desenvolvem ações que fazem a diferença no mundo ao nosso redor com o propósito de inspirar a solidariedade, gerar impacto positivo e promover a transformação social, fortalecendo o terceiro setor e capacitando projetos sociais. Trabalham para criar um mundo onde todas as pessoas tenham acesso à educação, saúde e amor, construindo um futuro mais justo e inclusivo para as próximas gerações.
                    </p>
                  </CardContent>
                </Card>

                {/* Instituto Mar Urbano */}
                <Card className="p-8">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <CardTitle className="text-xl font-bold text-primary">Instituto Mar Urbano</CardTitle>
                      <a 
                        href="https://institutomarurbano.com.br" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-base leading-relaxed">
                      O Instituto Mar Urbano é uma organização não governamental que trabalha com o propósito de gerar e compartilhar conhecimento sobre o ambiente marinho, com foco no bem-estar humano e nos recursos naturais de que a vida depende. Acreditam que "não se preserva aquilo que não se conhece" e, portanto, buscam não apenas levar o que sabemos às pessoas, mas também estimular novas formas de pensar e agir.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quem-somos" className="space-y-12">
              {/* Company Stats */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center p-6">
                  <CardHeader>
                     <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                       <Users className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">20+</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sócios e consultores com mais de 20 anos de atuação em consultoria de gestão 
                      e cargos executivos em empresas líderes
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6">
                  <CardHeader>
                     <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                       <Clock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">25K+</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Horas em projetos de diversos setores e tamanhos com reduções significativas 
                      de custo e aumento de eficiência
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center p-6">
                  <CardHeader>
                     <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                       <Award className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">100%</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Dos nossos clientes voltaram a fazer negócios conosco devido às soluções 
                      sob medida e visão integrada
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Cards */}
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Sócios Diretores</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Guilherme Carvalho */}
                  <Card className="p-8 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-6 mb-4">
                        <img 
                          src="/lovable-uploads/bf0c9029-d31d-4b1d-b6ee-091de0a0c1a2.png" 
                          alt="Guilherme Carvalho" 
                          className="w-32 h-48 rounded-lg object-cover border-2 border-primary/20"
                        />
                        <div>
                          <CardTitle className="text-xl font-bold text-primary mb-2">{teamMembers[0].nome}</CardTitle>
                          <Badge variant="secondary" className="w-fit">{teamMembers[0].cargo}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Resumo Profissional</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{teamMembers[0].resumo}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">+Detalhes</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{teamMembers[0].texto}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tatiana Rangel */}
                  <Card className="p-8 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-6 mb-4">
                        <img 
                          src="/lovable-uploads/3c7142a2-7e34-4d28-9643-0df0f93a251f.png" 
                          alt="Tatiana Rangel" 
                          className="w-32 h-48 rounded-lg object-cover border-2 border-primary/20 order-first"
                        />
                        <div>
                          <CardTitle className="text-xl font-bold text-primary mb-2">{teamMembers[1].nome}</CardTitle>
                          <Badge variant="secondary" className="w-fit">{teamMembers[1].cargo}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Resumo Profissional</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{teamMembers[1].resumo}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">+Detalhes</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{teamMembers[1].texto}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="solucoes" className="space-y-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Nossas Soluções</h3>
                <p className="text-xl text-gray-600">
                  Tecnologia e metodologia para transformar sua gestão
                </p>
              </div>

              <div className="grid gap-8">
                {solutions.map((solution, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-6">
                         <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <solution.icon className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">{solution.title}</CardTitle>
                          <CardDescription className="text-lg text-gray-600 leading-relaxed">
                            {solution.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Principais Funcionalidades:</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {solution.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                          <Link to={solution.link}>
                            <Button className="bg-primary hover:bg-accent">
                              Acessar Sistema
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Transformar sua Gestão?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Entre em contato conosco e descubra como podemos ajudar sua empresa 
            a alcançar excelência operacional com soluções sob medida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-primary border-white hover:bg-white hover:text-primary text-lg px-8 py-3"
              onClick={handleScheduleDemo}
            >
              Fale com a Orla
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/add9bf65-1a55-469f-a0d6-fd8fc3f294e7.png" 
                alt="Orla Consultoria" 
                className="w-full max-w-4xl h-auto"
              />
            </div>
            <p className="text-gray-600">Consultoria em Gestão Empresarial</p>
          </div>
          
          <Separator className="bg-gray-200 mb-6" />
          
          <p className="text-gray-500">
            © 2024 Orla Consultoria. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
