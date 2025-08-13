
import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import WaveLoading from "@/components/ui/wave-loading";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Landing2 from "./pages/Landing2";
import LandingDiagnostico from "./pages/LandingDiagnostico";
import QuemSomosPage from "./pages/QuemSomosPage";
import ProjectSelector from "./components/ProjectSelector";
import ProtectedRoute from "./components/ProtectedRoute";


// Lazy load heavy components

const ProjectsListPage = lazy(() => import("./pages/ProjectsListPage"));


const CadastroPage = lazy(() => import("./pages/CadastroPage"));

const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const KRIReportsPage = lazy(() => import("./pages/KRIReportsPage"));
const AuditoriaPage = lazy(() => import("./pages/AuditoriaPage"));
const GRCPage = lazy(() => import("./pages/GRCPage"));

const ProjetosIRBControlesInternos = lazy(() => import("./pages/ProjetosIRBControlesInternos"));
const DashboardCadeiaValor = lazy(() => import("./pages/DashboardCadeiaValor"));


const queryClient = new QueryClient();

// Componente para lidar com a rota principal e seleção automática de projeto
const HomeRouteHandler = ({ 
  selectedProject, 
  setSelectedProject, 
  handleProjectSelect, 
  handleHomeClick 
}: {
  selectedProject: any;
  setSelectedProject: (project: any) => void;
  handleProjectSelect: (project: any) => void;
  handleHomeClick: () => void;
}) => {
  const location = useLocation();

  useEffect(() => {
    const selectedProjectId = location.state?.selectedProjectId;
    if (selectedProjectId && !selectedProject) {
      // Carregar projeto específico do banco de dados
      const loadProject = async () => {
        try {
          const { data, error } = await supabase
            .from('project_info')
            .select('*')
            .eq('id', selectedProjectId)
            .single();

          if (error) {
            console.error('Erro ao carregar projeto:', error);
            return;
          }

          if (data) {
            setSelectedProject(data);
          }
        } catch (error) {
          console.error('Erro ao carregar projeto:', error);
        }
      };

      loadProject();
    }
  }, [location.state, selectedProject, setSelectedProject]);

  return selectedProject ? 
    <Index onHomeClick={handleHomeClick} selectedProject={selectedProject} /> : 
    <ProjectSelector onProjectSelect={handleProjectSelect} />;
};

const App = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
  };

  const handleHomeClick = () => {
    setSelectedProject(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><WaveLoading size="lg" text="Carregando aplicação..." /></div>}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/landing2" element={<Landing2 />} />
                <Route path="/landing-diagnostico" element={<LandingDiagnostico />} />
                <Route path="/quem-somos" element={<QuemSomosPage />} />              
                <Route path="/grc-nextgen-suit-landing-demo" element={
                  <ProtectedRoute>
                    {selectedProject ? 
                      <Index onHomeClick={handleHomeClick} selectedProject={selectedProject} /> : 
                      <ProjectsListPage onProjectSelect={handleProjectSelect} />
                    }
                  </ProtectedRoute>
                } />
                <Route path="/cadastro" element={<CadastroPage />} />
                <Route path="/relatorios-kri" element={
                  <ProtectedRoute>
                    <KRIReportsPage 
                      onBackClick={handleHomeClick}
                      selectedProject={selectedProject}
                    />
                  </ProtectedRoute>
                } />
                <Route path="/grc-nextgen-auditoria" element={
                  <ProtectedRoute>
                    <AuditoriaPage 
                      onHomeClick={handleHomeClick}
                      selectedProject={selectedProject}
                    />
                  </ProtectedRoute>
                } />
        <Route path="/grc-nextgen-suite" element={<GRCPage />} />
        
                <Route path="/grc-audit-demo" element={
                  <ProjectsListPage onProjectSelect={handleProjectSelect} />
                } />
                <Route path="/grc-nextgen-suite-cadeiadevalor" element={<DashboardCadeiaValor />} />
                <Route path="/grc-nextgen-ctrl-intern" element={<ProjetosIRBControlesInternos />} />
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
