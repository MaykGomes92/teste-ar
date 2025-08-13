
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LogoWithoutBackground from './LogoWithoutBackground';

interface NextGenHeaderProps {
  title: string;
  subtitle: string;
  badges?: {
    cliente?: string;
    progresso?: string;
    status?: string;
  };
  homeLink?: string;
  showHomeIcon?: boolean;
  showBackButton?: boolean;
}

const NextGenHeader = ({ 
  title, 
  subtitle, 
  badges = {}, 
  homeLink = "/",
  showHomeIcon = true,
  showBackButton = false
}: NextGenHeaderProps) => {
  return (
    <section className="bg-gradient-primary text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Conteúdo principal */}
          <div className="space-y-4 flex-1">
            {/* Badge principal */}
            <div className="inline-block">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                GRC NextGen Suite - {badges.cliente || 'Empresa ABC'}
              </Badge>
            </div>
            
            {/* Título principal */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              <span className="text-white">{title}</span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
            
            {/* Badges de status do projeto */}
            <div className="flex flex-wrap gap-3">
              {badges.cliente && (
                <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                  Cliente: {badges.cliente}
                </Badge>
              )}
              {badges.progresso && (
                <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                  Progresso: {badges.progresso}
                </Badge>
              )}
              {badges.status && (
                <Badge className="bg-white/10 text-white border-white/20 px-3 py-1">
                  Status: {badges.status}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Botão de voltar */}
          {showBackButton && (
            <div className="ml-6">
              <Link to="/grc-nextgen-suite">
                <Button variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NextGenHeader;
