import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CargaEmMassa = () => {
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadSections = [
    {
      id: "processos",
      title: "Processos",
      tableName: "processos",
      expectedColumns: ["id", "nome", "descricao", "macro_processo", "responsavel", "status", "validacao_etapa"],
      description: "Upload em massa de processos organizacionais"
    },
    {
      id: "riscos", 
      title: "Riscos",
      tableName: "riscos",
      expectedColumns: ["nome", "categoria", "probabilidade", "nivel_impacto", "processo_id", "responsavel", "descricao", "status", "validacao_etapa"],
      description: "Upload em massa de riscos identificados"
    },
    {
      id: "kris",
      title: "KRIs",
      tableName: "kris", 
      expectedColumns: ["nome", "categoria", "tipo_medicao", "frequencia_medicao", "processo_id", "risco_id", "responsavel", "descricao", "status", "validacao_etapa"],
      description: "Upload em massa de indicadores-chave de risco"
    },
    {
      id: "controles",
      title: "Controles",
      tableName: "kris",
      expectedColumns: ["nome", "categoria", "tipo_medicao", "frequencia_medicao", "processo_id", "risco_id", "responsavel", "descricao", "status", "validacao_etapa"],
      description: "Upload em massa de controles internos"
    },
    {
      id: "melhorias",
      title: "Melhorias", 
      tableName: "melhorias",
      expectedColumns: ["nome", "descricao", "processo_id", "responsavel", "status", "validacao_etapa"],
      description: "Upload em massa de ações de melhoria"
    },
    {
      id: "testes",
      title: "Testes",
      tableName: "testes",
      expectedColumns: ["nome", "controle_id", "procedimento_realizado", "data_execucao", "executor", "revisor", "maturidade", "mitigacao", "validacao_etapa"],
      description: "Upload em massa de testes de controles"
    }
  ];

  const downloadTemplate = (section: any) => {
    const headers = section.expectedColumns.join(",");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `template_${section.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template baixado",
      description: `Template de ${section.title} foi baixado com sucesso!`,
    });
  };

  const handleFileUpload = async (section: any, file: File) => {
    setUploading(section.id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const dataToInsert = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = { user_id: user.id };
        
        headers.forEach((header, index) => {
          let value = values[index] || null;
          
          if (header === 'validacao_etapa' && value) {
            obj[header] = parseInt(value) || 0;
          } else if (header.includes('_id') && value) {
            obj[header] = value;
          } else if (value) {
            obj[header] = value;
          }
        });
        
        return obj;
      }).filter(obj => Object.keys(obj).length > 1);

      // Get current project
      const { data: projects } = await supabase
        .from('project_info')
        .select('id')
        .limit(1);
      
      if (!projects || projects.length === 0) {
        throw new Error('Nenhum projeto encontrado');
      }

      const projectId = projects[0].id;

      // Add project_info_id to all records
      const dataWithProject = dataToInsert.map(item => ({
        ...item,
        project_info_id: projectId
      }));

      if (dataWithProject.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo');
      }

      let error;
      switch (section.tableName) {
        case 'processos':
          ({ error } = await supabase.from('processos').insert(dataWithProject));
          break;
        case 'riscos':
          ({ error } = await supabase.from('riscos').insert(dataWithProject));
          break;
        case 'kris':
          ({ error } = await supabase.from('kris').insert(dataWithProject));
          break;
        case 'melhorias':
          ({ error } = await supabase.from('melhorias').insert(dataWithProject));
          break;
        case 'testes':
          ({ error } = await supabase.from('testes').insert(dataWithProject));
          break;
        default:
          throw new Error(`Tabela ${section.tableName} não suportada`);
      }

      if (error) throw error;

      toast({
        title: "Upload Concluído",
        description: `${dataToInsert.length} registros de ${section.title} foram inseridos com sucesso!`,
      });

    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no Upload",
        description: error.message || "Não foi possível processar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Carga em Massa</h3>
        <p className="text-slate-600">Faça download dos templates e upload em massa de dados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uploadSections.map((section) => (
          <Card key={section.id} className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription className="text-sm">
                {section.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadTemplate(section)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload {section.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`file-${section.id}`}>Selecionar arquivo CSV</Label>
                        <Input
                          id={`file-${section.id}`}
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(section, file);
                            }
                          }}
                        />
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong>Colunas esperadas:</strong> {section.expectedColumns.join(', ')}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {uploading === section.id && (
                <div className="text-sm text-blue-600">Processando arquivo...</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Instruções importantes:</strong>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Baixe sempre o template antes de fazer o upload</li>
                <li>Validação Etapa: 0=Em Desenvolvimento, 1=Funcional, 2=QA, 3=Cliente, 4=Controles</li>
                <li>IDs de processo e risco devem existir na base de dados</li>
                <li>Arquivos devem estar no formato CSV com separador vírgula</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CargaEmMassa;