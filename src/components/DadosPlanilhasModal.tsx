import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DadosPlanilha {
  id: string;
  project_info_id: string;
  macro_processo: string;
  processo_id: string;
  processo_nome: string;
  nome_planilha: string;
  descricao?: string;
  tipo_dados?: string;
  sistema_origem?: string;
  responsavel_manutencao?: string;
  frequencia_atualizacao?: string;
  criticidade: string;
  validacao_etapa: number;
  status: string;
  evidencia_names?: string[];
  evidencia_paths?: string[];
  observacoes?: string;
}

interface Processo {
  id: string;
  nome: string;
  macro_processo: string;
}

interface DadosPlanilhasModalProps {
  open: boolean;
  onClose: () => void;
  editingDado: DadosPlanilha | null;
  projectId: string;
}

const DadosPlanilhasModal = ({ open, onClose, editingDado, projectId }: DadosPlanilhasModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    macro_processo: '',
    processo_id: '',
    processo_nome: '',
    nome_planilha: '',
    descricao: '',
    tipo_dados: '',
    sistema_origem: '',
    responsavel_manutencao: '',
    frequencia_atualizacao: '',
    criticidade: 'Média',
    validacao_etapa: 0,
    status: 'Ativo',
    observacoes: ''
  });

  const tipoDadosOptions = [
    'Operacional',
    'Financeiro',
    'Compliance',
    'Recursos Humanos',
    'Comercial',
    'Tecnologia',
    'Jurídico',
    'Outro'
  ];

  const frequenciaOptions = [
    'Tempo Real',
    'Diária',
    'Semanal',
    'Quinzenal',
    'Mensal',
    'Trimestral',
    'Semestral',
    'Anual',
    'Sob Demanda'
  ];

  const criticidadeOptions = [
    'Alta',
    'Média',
    'Baixa'
  ];

  useEffect(() => {
    if (open) {
      console.log('Modal aberto - Project ID recebido:', projectId);
      console.log('Modal aberto - Project ID é válido?', !!projectId);
      
      if (projectId) {
        fetchProcessos();
      } else {
        console.error('ERRO: Project ID não fornecido para o modal!');
      }
      
      if (editingDado) {
        setFormData({
          macro_processo: editingDado.macro_processo,
          processo_id: editingDado.processo_id,
          processo_nome: editingDado.processo_nome,
          nome_planilha: editingDado.nome_planilha,
          descricao: editingDado.descricao || '',
          tipo_dados: editingDado.tipo_dados || '',
          sistema_origem: editingDado.sistema_origem || '',
          responsavel_manutencao: editingDado.responsavel_manutencao || '',
          frequencia_atualizacao: editingDado.frequencia_atualizacao || '',
          criticidade: editingDado.criticidade,
          validacao_etapa: editingDado.validacao_etapa,
          status: editingDado.status,
          observacoes: editingDado.observacoes || ''
        });
      } else {
        resetForm();
      }
    }
  }, [open, editingDado, projectId]);

  const fetchProcessos = async () => {
    if (!projectId) {
      console.log('ProjectId não fornecido para busca de processos');
      return;
    }

    try {
      console.log('Buscando processos para projeto:', projectId);
      
      // Primeira busca: verificar todos os processos na tabela
      const { data: allProcessos, error: allError } = await supabase
        .from('processos')
        .select('*');
      
      console.log('TODOS os processos no banco:', allProcessos);
      
      // Segunda busca: processos do projeto específico
      const { data, error } = await supabase
        .from('processos')
        .select('id, nome, macro_processo, project_info_id, status, codigo')
        .eq('project_info_id', projectId);

      if (error) {
        console.error('Erro na query de processos:', error);
        return;
      }
      
      console.log('Processos do projeto específico:', data);
      console.log('Project ID usado na busca:', projectId);
      console.log('Total de processos encontrados:', data?.length || 0);
      
      // Se não encontrou nada, vamos verificar se existem processos sem project_info_id
      if (!data || data.length === 0) {
        const { data: processosOrfaos } = await supabase
          .from('processos')
          .select('*')
          .is('project_info_id', null);
        
        console.log('Processos sem project_info_id:', processosOrfaos);
      }
      
      setProcessos(data || []);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      macro_processo: '',
      processo_id: '',
      processo_nome: '',
      nome_planilha: '',
      descricao: '',
      tipo_dados: '',
      sistema_origem: '',
      responsavel_manutencao: '',
      frequencia_atualizacao: '',
      criticidade: 'Média',
      validacao_etapa: 0,
      status: 'Ativo',
      observacoes: ''
    });
    setSelectedFiles([]);
  };

  const handleProcessoChange = (processoId: string) => {
    const processo = processos.find(p => p.id === processoId);
    if (processo) {
      setFormData(prev => ({
        ...prev,
        processo_id: processoId,
        processo_nome: processo.nome,
        macro_processo: processo.macro_processo
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return { names: [], paths: [] };

    const names: string[] = [];
    const paths: string[] = [];

    for (const file of selectedFiles) {
      const fileName = `${user?.id}/${Date.now()}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('dados-evidencias')
        .upload(fileName, file);

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      names.push(file.name);
      paths.push(fileName);
    }

    return { names, paths };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.processo_id || !formData.nome_planilha) {
      toast({
        title: "Erro",
        description: "Processo e nome da planilha são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Upload dos arquivos se houver
      const { names, paths } = await uploadFiles();

      const dadoData = {
        project_info_id: projectId,
        user_id: user?.id,
        ...formData,
        evidencia_names: names.length > 0 ? names : undefined,
        evidencia_paths: paths.length > 0 ? paths : undefined
      };

      let result;
      if (editingDado) {
        // Manter evidências existentes se não houver novas
        if (names.length === 0 && editingDado.evidencia_names) {
          dadoData.evidencia_names = editingDado.evidencia_names;
          dadoData.evidencia_paths = editingDado.evidencia_paths;
        }
        
        result = await supabase
          .from('dados_planilhas')
          .update(dadoData)
          .eq('id', editingDado.id);
      } else {
        result = await supabase
          .from('dados_planilhas')
          .insert([dadoData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: editingDado ? "Registro atualizado com sucesso!" : "Registro criado com sucesso!",
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o registro",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const macroProcessos = Array.from(new Set(processos.map(p => p.macro_processo)));
  const processosFiltered = processos.filter(p => p.macro_processo === formData.macro_processo);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDado ? 'Editar' : 'Novo'} Registro de Dados
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Processo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="macro_processo">Macro Processo *</Label>
              <Select 
                value={formData.macro_processo} 
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, macro_processo: value, processo_id: '', processo_nome: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o macro processo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {macroProcessos.map(mp => (
                    <SelectItem key={mp} value={mp}>{mp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {macroProcessos.length === 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Nenhum processo encontrado neste projeto. Cadastre processos primeiro na aba "Processos".
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="processo">Processo *</Label>
              <Select value={formData.processo_id} onValueChange={handleProcessoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o processo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {processosFiltered.map(processo => (
                      <SelectItem key={processo.id} value={processo.id}>
                        {processo.id} - {processo.nome}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.macro_processo && processosFiltered.length === 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ Nenhum processo encontrado para este macro processo.
                </div>
              )}
            </div>
          </div>

          {/* Dados da Planilha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_planilha">Nome da Planilha *</Label>
              <Input
                id="nome_planilha"
                value={formData.nome_planilha}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_planilha: e.target.value }))}
                placeholder="Ex: Relatório Financeiro Mensal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_dados">Tipo de Dados</Label>
              <Select value={formData.tipo_dados} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, tipo_dados: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipoDadosOptions.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o conteúdo e propósito da planilha"
            />
          </div>

          {/* Detalhes Técnicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sistema_origem">Sistema de Origem</Label>
              <Input
                id="sistema_origem"
                value={formData.sistema_origem}
                onChange={(e) => setFormData(prev => ({ ...prev, sistema_origem: e.target.value }))}
                placeholder="Ex: SAP, Excel, Protheus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_manutencao">Responsável pela Manutenção</Label>
              <Input
                id="responsavel_manutencao"
                value={formData.responsavel_manutencao}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel_manutencao: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequencia_atualizacao">Frequência de Atualização</Label>
              <Select value={formData.frequencia_atualizacao} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, frequencia_atualizacao: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {frequenciaOptions.map(freq => (
                    <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticidade">Criticidade</Label>
              <Select value={formData.criticidade} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, criticidade: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criticidadeOptions.map(crit => (
                    <SelectItem key={crit} value={crit}>{crit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validacao_etapa">Validação</Label>
              <Select value={formData.validacao_etapa.toString()} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, validacao_etapa: parseInt(value) }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Não Iniciado</SelectItem>
                  <SelectItem value="1">Em desenvolvimento</SelectItem>
                  <SelectItem value="2">Em revisão</SelectItem>
                  <SelectItem value="3">Aprovação QA CI</SelectItem>
                  <SelectItem value="4">Aprovação Cliente</SelectItem>
                  <SelectItem value="5">Aprovação CI</SelectItem>
                  <SelectItem value="6">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload de Evidências */}
          <div className="space-y-2">
            <Label>Evidências / Planilhas</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="evidencias"
                multiple
                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="evidencias" className="cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800">
                <Upload className="w-5 h-5" />
                Clique para adicionar arquivos ou arraste aqui
              </label>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais sobre a planilha"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DadosPlanilhasModal;