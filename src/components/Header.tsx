
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-orla-teal-dark px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Sistema de Gestão</h1>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <User className="w-4 h-4 text-white" />
              <span>{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
