
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LogoWithoutBackground from "@/components/LogoWithoutBackground";
import { Eye, EyeOff } from "lucide-react";
import GlobalHeader from "@/components/shared/GlobalHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleDirectAccess = () => {
    navigate('/projetos-clientes');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            nome: signupData.nome,
          },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <GlobalHeader />
      <div className="bg-slate-50 flex flex-col justify-between p-4 sm:p-6 pt-20">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/landing')}
              className="flex items-center gap-2 hover:bg-transparent"
            >
              <LogoWithoutBackground className="h-8 w-auto" />
            </Button>
          </div>
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="flex justify-center mb-4">
                <LogoWithoutBackground className="h-12 sm:h-16 w-auto" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Acesso ao Sistema</CardTitle>
              <CardDescription>
                Clique no botão abaixo para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-slate-600">
                    Acesso livre ao sistema, sem necessidade de cadastro ou login.
                  </p>
                </div>
                
                <Button 
                  onClick={handleDirectAccess}
                  className="w-full bg-primary hover:bg-accent" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Acessando..." : "Acessar Sistema"}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Sistema de demonstração - acesso liberado para todos os usuários
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 px-6 border-t mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-4">
            <div className="flex justify-center mb-3">
              <img 
                src="/lovable-uploads/add9bf65-1a55-469f-a0d6-fd8fc3f294e7.png" 
                alt="Orla Consultoria" 
                className="w-full max-w-2xl h-auto"
              />
            </div>
            <p className="text-gray-600 text-sm">Sistema de Acesso - Gestão de Processos</p>
          </div>
          
          <Separator className="bg-gray-200 mb-4" />
          
          <p className="text-gray-500 text-sm">
            © 2024 Orla Consultoria. Todos os direitos reservados.
          </p>
        </div>
      </footer>
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default AuthPage;
