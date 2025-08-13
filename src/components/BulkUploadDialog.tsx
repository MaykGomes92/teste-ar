import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BulkUploadDialogProps {
  tableName: string;
  displayName: string;
  expectedColumns: string[];
  onSuccess: () => void;
}

const BulkUploadDialog = ({ tableName, displayName, expectedColumns, onSuccess }: BulkUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Preview do arquivo
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || '';
        });
        return obj;
      });
      
      setPreview(dataRows.filter(row => Object.values(row).some(v => v)));
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
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
          
          // Conversões específicas
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

      // Add user_id and project_info_id to all records
      const dataWithUserAndProject = dataToInsert.map(item => ({
        ...item,
        user_id: user.id,
        project_info_id: projectId
      }));

      if (dataWithUserAndProject.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo');
      }

      let error;
      // TypeScript safe table access
      switch (tableName) {
        case 'processos':
          ({ error } = await supabase.from('processos').insert(dataWithUserAndProject));
          break;
        case 'riscos':
          ({ error } = await supabase.from('riscos').insert(dataWithUserAndProject));
          break;
        case 'kris':
          ({ error } = await supabase.from('kris').insert(dataWithUserAndProject));
          break;
        case 'melhorias':
          ({ error } = await supabase.from('melhorias').insert(dataWithUserAndProject));
          break;
        case 'testes':
          ({ error } = await supabase.from('testes').insert(dataWithUserAndProject));
          break;
        default:
          throw new Error(`Tabela ${tableName} não suportada para upload`);
      }

      if (error) throw error;

      toast({
        title: "Upload Concluído",
        description: `${dataToInsert.length} registros de ${displayName} foram inseridos com sucesso!`,
      });

      setFile(null);
      setPreview([]);
      onSuccess();
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no Upload",
        description: error.message || "Não foi possível processar o arquivo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload {displayName}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload em Massa - {displayName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label>Selecionar Arquivo CSV</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <div className="text-sm text-gray-600">
              <strong>Colunas esperadas:</strong> {expectedColumns.join(', ')}
            </div>
          </div>

          {/* Preview dos Dados */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview dos Dados (primeiras 5 linhas)</Label>
              <div className="border rounded-lg overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((key) => (
                        <th key={key} className="p-2 text-left border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="p-2 border-b">
                            {value || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Avisos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Instruções:</strong>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Use o template baixado como base</li>
                  <li>Validação Etapa: 0=Não Iniciado, 1=Em desenvolvimento, 2=Em revisão, 3=Aprovação QA CI, 4=Aprovação Cliente, 5=Aprovação CI, 6=Concluído</li>
                  <li>IDs de processo devem existir na base</li>
                  <li>Dados serão validados antes da inserção</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processando..." : "Fazer Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;