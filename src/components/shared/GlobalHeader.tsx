import { Button } from "@/components/ui/button";
import { UserPlus, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const GlobalHeader = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo removida conforme solicitado */}
        </div>
        
        <nav className="hidden md:flex items-center gap-12">
          <Link to="/quem-somos" className="text-white hover:text-white/80 transition-colors">Quem Somos</Link>
          <a href="#servicos" className="text-white hover:text-white/80 transition-colors">Serviços</a>
          <a href="#solucoes" className="text-white hover:text-white/80 transition-colors">Soluções</a>
          <a href="#contato" className="text-white hover:text-white/80 transition-colors">Contato</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/cadastro">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastro
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="md:hidden text-white">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;