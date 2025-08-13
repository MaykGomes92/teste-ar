import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Database, CloudDownload, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DatabaseBackup = () => {
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();

  const exportTableData = async (tableName: string) => {
    try {
      let data;
      let error;

      // TypeScript safe table access
      switch (tableName) {
        case 'processos':
          ({ data, error } = await supabase.from('processos').select('*'));
          break;
        case 'riscos':
          ({ data, error } = await supabase.from('riscos').select('*'));
          break;
        case 'kris':
          ({ data, error } = await supabase.from('kris').select('*'));
          break;
        case 'melhorias':
          ({ data, error } = await supabase.from('melhorias').select('*'));
          break;
        case 'testes':
          ({ data, error } = await supabase.from('testes').select('*'));
          break;
        case 'project_info':
          ({ data, error } = await supabase.from('project_info').select('*'));
          break;
        case 'project_details':
          ({ data, error } = await supabase.from('project_details').select('*'));
          break;
        case 'dados_planilhas':
          ({ data, error } = await supabase.from('dados_planilhas').select('*'));
          break;
        default:
          throw new Error(`Tabela ${tableName} não suportada`);
      }

      if (error) throw error;

      const csvContent = convertToCSV(data || []);
      downloadCSV(csvContent, `${tableName}_backup.csv`);
      
      return data;
    } catch (error) {
      console.error(`Erro ao exportar ${tableName}:`, error);
      throw error;
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullBackup = async () => {
    setLoading(true);
    try {
      const tables = ['processos', 'riscos', 'kris', 'melhorias', 'testes', 'project_info', 'project_details', 'dados_planilhas'];
      const backupData: any = {};
      
      for (const table of tables) {
        const data = await exportTableData(table);
        backupData[table] = data;
      }

      // Download como JSON completo
      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast({
        title: "Backup Completo",
        description: "Todos os dados foram exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no Backup",
        description: "Não foi possível realizar o backup completo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableBackup = async (tableName: string, displayName: string) => {
    setLoading(true);
    try {
      await exportTableData(tableName);
      toast({
        title: "Backup Realizado",
        description: `Dados de ${displayName} exportados com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro no Backup",
        description: `Não foi possível exportar ${displayName}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setLoading(true);
    try {
      const text = await uploadFile.text();
      const data = JSON.parse(text);
      
      // Aqui você implementaria a lógica de restore
      // Por segurança, vamos apenas mostrar um preview
      
      toast({
        title: "Arquivo Carregado",
        description: "Funcionalidade de restore em desenvolvimento por segurança.",
      });
    } catch (error) {
      toast({
        title: "Erro no Upload",
        description: "Arquivo inválido ou corrompido.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tables = [
    { name: 'processos', display: 'Processos', icon: FileText },
    { name: 'riscos', display: 'Riscos', icon: AlertTriangle },
    { name: 'kris', display: 'Controles/KRIs', icon: Database },
    { name: 'melhorias', display: 'Melhorias', icon: Database },
    { name: 'testes', display: 'Testes', icon: Database },
    { name: 'dados_planilhas', display: 'Dados Planilhas', icon: FileText },
    { name: 'project_info', display: 'Informações Projeto', icon: Database },
    { name: 'project_details', display: 'Detalhes Projeto', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Backup e Restauração</h3>
          <p className="text-slate-600">Gerencie backups dos dados do sistema</p>
        </div>
        <Button 
          onClick={handleFullBackup}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <CloudDownload className="w-4 h-4 mr-2" />
          Backup Completo
        </Button>
      </div>

      {/* Backup por Tabela */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <table.icon className="w-4 h-4" />
                {table.display}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTableBackup(table.name, table.display)}
                disabled={loading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Restauração de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Selecione um arquivo de backup para restaurar
            </p>
            <Input
              type="file"
              accept=".json,.csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="max-w-xs mx-auto"
            />
          </div>
          
          {uploadFile && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{uploadFile.name}</span>
              </div>
              <Button
                size="sm"
                onClick={handleFileUpload}
                disabled={loading}
              >
                Processar
              </Button>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Atenção:</strong> A funcionalidade de restauração está em desenvolvimento.
                Por motivos de segurança, apenas a visualização dos dados está disponível.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseBackup;