import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Linkedin } from "lucide-react";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const QuemSomosPage = () => {
  const socios = [
    {
      nome: "Guilherme Carvalho",
      cargo: "Sócio",
      imagem: "/lovable-uploads/6d71c486-0aac-449f-b7da-b6cb4bde799b.png",
      descricao: "Profissional multidisciplinar com mais de 25 anos de experiência, especialista em Suprimentos e Gestão de Gastos, Transformação e Gestão de Mudanças, focado em resultados e com alta capacidade de entrega.",
      experiencia: "Executivo da Vale com especialização no MIT, atuação em Startups, Accenture (em múltiplos clientes), com vasta experiência em Planejamento Estratégico, Criação e Transformação de Negócios, Implantação de CSC globais em mais de 15 países, Estabelecimento e Melhoria de Processos, Cadeia de Suprimentos, Gestão de Custos e Gastos, Gestão de Performance, Integração e Reestruturação de Empresas, Implantação de Centro de Excelência, Serviços compartilhados e BPO's.",
      email: "guilherme.carvalho@orlaconsultoria.com.br"
    },
    {
      nome: "Tatiana Rangel",
      cargo: "Sócia",
      imagem: "/lovable-uploads/6d71c486-0aac-449f-b7da-b6cb4bde799b.png",
      descricao: "Profissional com mais de 20 anos de experiência em Processos, reconhecida por atuar em projetos de grandes transformações, com excelência em integrações de empresas Pós-fusão e Aquisição.",
      experiencia: "Atuação como consultora de processos na Deloitte e TOTVS, além de sócia da consultoria Ekons. Possui vasta experiência em projetos nos setores de Educação, Petróleo & Gás, Mineração, Transporte e Entretenimento. Liderança em frentes estratégicas dos projetos de integração de novas aquisições e de capital no CSC da Vale, em nível global. Atuou como Head de CSC e Gestão de Serviços em grandes empresas, como a Estácio.",
      email: "tatianarangel@orlaconsultoria.com.br"
    }
  ];

  return (
    <div className="min-h-screen">
      <GlobalHeader />
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/landing2">
              <Button variant="ghost" size="sm" className="text-primary hover:text-accent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <LogoWithoutBackground className="h-8" />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/landing2#servicos" className="text-gray-700 hover:text-primary transition-colors">Serviços</Link>
            <Link to="/landing2#solucoes" className="text-gray-700 hover:text-primary transition-colors">Soluções</Link>
            <Link to="/landing2#contato" className="text-gray-700 hover:text-primary transition-colors">Contato</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-accent to-primary-dark text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium mb-6">
            Quem Somos
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Conheça Nossa Equipe
          </h1>
          
          <p className="text-xl text-white/90 leading-relaxed max-w-4xl mx-auto">
            Profissionais experientes com décadas de expertise em transformação empresarial, 
            focados em entregar resultados excepcionais através de inteligência humana e conhecimento técnico prático.
          </p>
        </div>
      </section>

      {/* Sócios Section */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossos Sócios
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Líderes com vasta experiência em grandes corporações e projetos de transformação,
              unidos pelo propósito de gerar impacto real nos negócios de nossos clientes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {socios.map((socio, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                <CardHeader className="text-center pb-6">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={socio.imagem} 
                      alt={socio.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    {socio.nome}
                  </CardTitle>
                  <Badge className="bg-primary text-white px-3 py-1">
                    {socio.cargo}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <CardDescription className="text-base text-gray-700 leading-relaxed font-medium">
                    {socio.descricao}
                  </CardDescription>
                  
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {socio.experiencia}
                  </CardDescription>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossos Valores
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Princípios que guiam nossa atuação e garantem a excelência em cada projeto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Inteligência Humana</h3>
              <p className="text-gray-600 leading-relaxed">
                Valorizamos o conhecimento técnico prático e a experiência humana como diferenciais 
                competitivos em um mundo cada vez mais automatizado.
              </p>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Resultados Práticos</h3>
              <p className="text-gray-600 leading-relaxed">
                Focamos na entrega de soluções que geram impacto real e mensurável no negócio,
                sempre alinhadas aos objetivos estratégicos de nossos clientes.
              </p>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Transformação Sustentável</h3>
              <p className="text-gray-600 leading-relaxed">
                Desenvolvemos mudanças duradouras que potencializam a eficiência, reduzem riscos
                e promovem o crescimento sustentável das organizações.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary via-accent to-primary-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Vamos Conversar?
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Entre em contato conosco e descubra como nossa experiência pode transformar seu negócio.
          </p>
          
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
            <Mail className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
      
      <GlobalFooter />
    </div>
  );
};

export default QuemSomosPage;