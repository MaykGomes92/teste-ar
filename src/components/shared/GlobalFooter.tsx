import { Link } from "react-router-dom";
import { Linkedin, Instagram, Globe, ChevronDown, Mail, Phone } from "lucide-react";

const GlobalFooter = () => {
  return (
    <footer className="bg-gradient-to-br from-primary via-accent to-primary-dark">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top section with social links */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
          <div className="max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Conecte-se conosco</h3>
            <p className="text-white/80 mb-6">
              Siga-nos nas redes sociais para ficar por dentro das últimas novidades e insights em governança corporativa.
            </p>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/orlaconsultoria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Linkedin className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.instagram.com/orlaconsultoria" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
          
          {/* Region selector */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            <div className="flex items-center gap-2 bg-white/20 border border-white/30 rounded-lg px-4 py-2 hover:border-white/40 transition-colors cursor-pointer">
              <Globe className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Global</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </div>
            <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
              Atualizar preferências de cookies
            </a>
          </div>
        </div>
        
        {/* Links sections */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
          {/* Quem Somos */}
          <div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/quem-somos" className="text-white hover:text-white/80 transition-colors font-medium">Quem somos</Link></li>
              <li><a href="#servicos" className="text-white/80 hover:text-white transition-colors">O que fazemos</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Nossa gente</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Código de Conduta</a></li>
            </ul>
          </div>
          
          {/* Transparência */}
          <div>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">A Orla agora</a></li>
              <li><a href="#contato" className="text-white/80 hover:text-white transition-colors">Fale com a Orla</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Acessibilidade</a></li>
            </ul>
          </div>
          
          {/* Soluções */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Soluções</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/grc-nextgen-suite" className="text-white/80 hover:text-white transition-colors">GRC NextGen Suite</Link></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Portal Orla</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Centro de Excelência</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Orla Academy</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Orla Digital</a></li>
            </ul>
          </div>
          
          {/* Iniciativas */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Iniciativas</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://www.institutodacrianca.org.br/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Instituto da Criança</a></li>
              <li><a href="https://institutomarurbano.com.br/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">Instituto Mar Urbano</a></li>
            </ul>
          </div>
          
          {/* Tecnologia */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Tecnologia</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Instituto Tecnológico</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Centro Cultural Orla</a></li>
              <li><a href="https://maturidade-de-processos.lovable.app" target="_blank" className="text-white/80 hover:text-white transition-colors">Avaliação de Maturidade</a></li>
            </ul>
          </div>
          
          {/* Instituto Onda */}
          <div>
            <h4 className="font-semibold mb-3 text-white">Instituto Onda</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Diagnóstico de PME</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Consultoria Especializada</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Capacitação Empresarial</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Mentoria Executiva</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom copyright */}
        <div className="border-t border-white/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/80">
            <p>&copy; 2024 Grupo Oceano - Orla Consultoria. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  const recipients = "guilherme.carvalho@orlaconsultoria.com.br,tatianarangel@orlaconsultoria.com.br";
                  const subject = "Solicitação de Contato - Orla Consultoria";
                  const body = "Olá,%0D%0A%0D%0AGostaria de saber mais sobre as soluções da Orla Consultoria.%0D%0A%0D%0APor favor, entrem em contato para agendarmos uma conversa.%0D%0A%0D%0AObrigado!";
                  window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;
                }}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contato
              </a>
              <a href="tel:+5521970058558" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                Telefone
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;