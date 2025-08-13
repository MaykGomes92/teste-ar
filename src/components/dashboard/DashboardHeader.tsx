
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Home, LogOut, Settings, User, Building2, Users, GitBranch, Package, Calendar, AlertTriangle, Shield, Database, ArrowLeft } from 'lucide-react';
import LogoWithoutBackground from '../LogoWithoutBackground';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onHomeClick?: () => void;
  onCadastroSelect?: (cadastro: string) => void;
  selectedProject?: any;
}

const DashboardHeader = ({ onHomeClick, onCadastroSelect, selectedProject }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCadastroClick = (cadastro: string) => {
    onCadastroSelect?.(cadastro);
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm shadow-lg border-b">
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'}`}>
          <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'space-x-4'}`}>
            <div className="flex items-center space-x-3">
              {selectedProject?.cliente === 'Empresa ABC' ? (
                <img 
                  src="/lovable-uploads/c3aa3f44-4c7c-4e7a-b3bb-f5d8c21637e6.png" 
                  alt="Empresa ABC" 
                  className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} object-contain`}
                />
              ) : (
                <>
                  <LogoWithoutBackground className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} object-contain`} />
                </>
              )}
            </div>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-slate-800 break-words`}>
                {selectedProject ? `${selectedProject.cliente} - ${selectedProject.nome_projeto}` : 'Dashboard de Controles'}
              </h1>
              <p className={`text-slate-600 ${isMobile ? 'text-xs' : 'text-sm'} break-words`}>
                Sistema de Gestão de Riscos e Controles
              </p>
            </div>
          </div>

          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
            <Link to="/projetos-irb-ci">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
              </Button>
            </Link>

            <Button
              variant="outline" 
              onClick={() => handleCadastroClick('informacoes-projeto')}
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              {isMobile ? 'Projeto' : 'Informações do Projeto'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Cadastros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => handleCadastroClick('informacoes-projeto')}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Informações do Projeto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCadastroClick('usuarios')}>
                  <Users className="w-4 h-4 mr-2" />
                  Usuários do Projeto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCadastroClick('cadeia')}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Cadeia de Valor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCadastroClick('entregaveis')}>
                  <Package className="w-4 h-4 mr-2" />
                  Entregáveis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCadastroClick('cronograma')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Cronograma
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCadastroClick('riscos')}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Colunas de Riscos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCadastroClick('controles')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Colunas de Controles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCadastroClick('backup')}>
                  <Database className="w-4 h-4 mr-2" />
                  Backup e Restauração
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="@user" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
