import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BulkUploadTemplates = () => {
  const { toast } = useToast();

  const templates = [
    {
      name: "Processos",
      fileName: "template_processos.xlsx",
      columns: ["ID", "Nome", "Descrição", "Macro Processo", "Responsável", "Status", "Validação Etapa"]
    },
    {
      name: "Riscos", 
      fileName: "template_riscos.xlsx",
      columns: ["Nome", "Categoria", "Probabilidade", "Impacto", "Processo ID", "Responsável", "Descrição", "Status", "Validação Etapa"]
    },
    {
      name: "Controles",
      fileName: "template_controles.xlsx", 
      columns: ["Nome", "Categoria", "Tipo Medição", "Frequência", "Processo ID", "Risco ID", "Responsável", "Descrição", "Status", "Validação Etapa"]
    },
    {
      name: "KRIs",
      fileName: "template_kris.xlsx",
      columns: ["Nome", "Categoria", "Tipo Medição", "Frequência", "Meta Tier1", "Meta Tier2", "Meta Tier3", "Processo ID", "Responsável", "Status", "Validação Etapa"]
    },
    {
      name: "Melhorias",
      fileName: "template_melhorias.xlsx",
      columns: ["Nome", "Descrição", "Processo ID", "Responsável", "Status", "Validação Etapa"]
    },
    {
      name: "Testes",
      fileName: "template_testes.xlsx", 
      columns: ["Nome", "Controle ID", "Procedimento", "Data Execução", "Executor", "Revisor", "Maturidade", "Mitigação", "Validação Etapa"]
    }
  ];

  const downloadTemplate = (template: any) => {
    // Criar CSV simples para template
    const headers = template.columns.join(",");
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", template.fileName.replace('.xlsx', '.csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template baixado",
      description: `Template de ${template.name} foi baixado com sucesso!`,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Templates & Carga
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Templates para Carga em Massa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {templates.map((template) => (
              <div key={template.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Button 
                    size="sm" 
                    onClick={() => downloadTemplate(template)}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Colunas:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {template.columns.map((col, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Instruções para Carga em Massa</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Baixe o template desejado clicando no botão "Baixar"</p>
              <p>2. Preencha o arquivo com seus dados seguindo as colunas definidas</p>
              <p>3. Validação Etapa: 0=Não Iniciado, 1=Em desenvolvimento, 2=Em revisão, 3=Aprovação QA CI, 4=Aprovação Cliente, 5=Aprovação CI, 6=Concluído</p>
              <p>4. Salve o arquivo e utilize a funcionalidade de upload (em desenvolvimento)</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadTemplates;