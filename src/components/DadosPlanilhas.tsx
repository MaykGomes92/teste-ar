import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Database, Upload, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DadosPlanilhasModal from "./DadosPlanilhasModal";
import FilterBar from "./FilterBar";
import * as XLSX from 'xlsx';

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
  created_at: string;
  updated_at: string;
}

interface DadosPlanilhasProps {
  selectedProject?: string;
}

const DadosPlanilhas = ({ selectedProject }: DadosPlanilhasProps) => {
  const [dados, setDados] = useState<DadosPlanilha[]>([]);
  const [filteredDados, setFilteredDados] = useState<DadosPlanilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDado, setEditingDado] = useState<DadosPlanilha | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMacroProcess, setSelectedMacroProcess] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedValidation, setSelectedValidation] = useState("all");
  const { toast } = useToast();

  const statusOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "Ativo", label: "Ativo" },
    { value: "Inativo", label: "Inativo" },
    { value: "Em Revisão", label: "Em Revisão" }
  ];

  const validationOptions = [
    { value: "all", label: "Todas as Validações" },
    { value: "0", label: "Não Iniciado" },
    { value: "1", label: "Em desenvolvimento" },
    { value: "2", label: "Em revisão" },
    { value: "3", label: "Aprovação QA CI" },
    { value: "4", label: "Aprovação Cliente" },
    { value: "5", label: "Aprovação CI" },
    { value: "6", label: "Concluído" }
  ];

  useEffect(() => {
    if (selectedProject) {
      fetchDados();
    }
  }, [selectedProject]);

  // Recarregar dados quando a janela recebe foco
  useEffect(() => {
    const handleFocus = () => {
      if (selectedProject) {
        fetchDados();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedProject]);

  useEffect(() => {
    applyFilters();
  }, [dados, searchQuery, selectedMacroProcess, selectedStatus, selectedValidation]);

  const fetchDados = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dados_planilhas')
        .select('*')
        .eq('project_info_id', selectedProject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDados(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados das planilhas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = dados;

    if (searchQuery) {
      filtered = filtered.filter(dado =>
        dado.nome_planilha.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dado.processo_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dado.macro_processo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedMacroProcess !== "all") {
      filtered = filtered.filter(dado => dado.macro_processo === selectedMacroProcess);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(dado => dado.status === selectedStatus);
    }

    if (selectedValidation !== "all") {
      filtered = filtered.filter(dado => dado.validacao_etapa.toString() === selectedValidation);
    }

    setFilteredDados(filtered);
  };

  const handleEdit = (dado: DadosPlanilha) => {
    setEditingDado(dado);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
      const { error } = await supabase
        .from('dados_planilhas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
      });
      
      fetchDados();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro",
        variant: "destructive",
      });
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingDado(null);
    fetchDados();
  };

  const getValidationBadge = (etapa: number) => {
    const badges = {
      0: { label: "Não Iniciado", className: "bg-gray-100 text-gray-800" },
      1: { label: "Em desenvolvimento", className: "bg-blue-100 text-blue-800" },
      2: { label: "Em revisão", className: "bg-yellow-100 text-yellow-800" },
      3: { label: "Aprovação QA CI", className: "bg-orange-100 text-orange-800" },
      4: { label: "Aprovação Cliente", className: "bg-purple-100 text-purple-800" },
      5: { label: "Aprovação CI", className: "bg-green-100 text-green-800" },
      6: { label: "Concluído", className: "bg-emerald-100 text-emerald-800" }
    };
    
    const badge = badges[etapa as keyof typeof badges] || badges[0];
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getCriticidadeBadge = (criticidade: string) => {
    const colors = {
      "Alta": "bg-red-100 text-red-800",
      "Média": "bg-yellow-100 text-yellow-800", 
      "Baixa": "bg-green-100 text-green-800"
    };
    return <Badge className={colors[criticidade as keyof typeof colors] || colors["Média"]}>{criticidade}</Badge>;
  };

  const macroProcessOptions = [
    { value: "all", label: "Todos os Macro Processos" },
    ...Array.from(new Set(dados.map(d => d.macro_processo))).map(mp => ({ value: mp, label: mp }))
  ];

  const handleDownloadXLS = () => {
    const data = filteredDados.map(dado => ({
      'Macro Processo': dado.macro_processo,
      'Processo Nome': dado.processo_nome,
      'Nome Planilha': dado.nome_planilha,
      'Descrição': dado.descricao || '',
      'Tipo Dados': dado.tipo_dados || '',
      'Sistema Origem': dado.sistema_origem || '',
      'Responsável Manutenção': dado.responsavel_manutencao || '',
      'Frequência Atualização': dado.frequencia_atualizacao || '',
      'Criticidade': dado.criticidade,
      'Status': dado.status,
      'Validação Etapa': dado.validacao_etapa || 0,
      'Observações': dado.observacoes || '',
      'Criado em': new Date(dado.created_at).toLocaleDateString('pt-BR'),
      'Atualizado em': new Date(dado.updated_at).toLocaleDateString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados Planilhas');
    XLSX.writeFile(wb, `dados_planilhas_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Sucesso",
      description: "Arquivo XLS baixado com sucesso!",
    });
  };

  const handleUploadXLS = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData as any[]) {
        try {
          if (!row['Nome Planilha'] || !row['Macro Processo']) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from('dados_planilhas')
            .insert({
              macro_processo: row['Macro Processo'],
              processo_nome: row['Processo Nome'] || '',
              nome_planilha: row['Nome Planilha'],
              descricao: row['Descrição'] || '',
              tipo_dados: row['Tipo Dados'] || '',
              sistema_origem: row['Sistema Origem'] || '',
              responsavel_manutencao: row['Responsável Manutenção'] || '',
              frequencia_atualizacao: row['Frequência Atualização'] || '',
              criticidade: row['Criticidade'] || 'Média',
              status: row['Status'] || 'Ativo',
              validacao_etapa: parseInt(row['Validação Etapa']) || 0,
              observacoes: row['Observações'] || '',
              project_info_id: selectedProject
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error('Erro ao inserir dados planilha:', row, error);
          errorCount++;
        }
      }

      toast({
        title: "Upload concluído",
        description: `${successCount} registros importados com sucesso. ${errorCount} erros.`,
      });

      fetchDados();
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo XLS",
        variant: "destructive",
      });
    }

    event.target.value = '';
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando dados das planilhas...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Dados e Planilhas
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => handleDownloadXLS()}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar XLS
              </Button>
              
              <Button 
                variant="outline" 
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                onClick={() => document.getElementById('upload-dados-xls')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Carga Massa XLS
              </Button>

              <input
                id="upload-dados-xls"
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleUploadXLS}
              />

              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Buscar por nome, processo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedMacroProcess} onValueChange={setSelectedMacroProcess}>
              <SelectTrigger>
                <SelectValue placeholder="Macro Processo" />
              </SelectTrigger>
              <SelectContent>
                {macroProcessOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedValidation} onValueChange={setSelectedValidation}>
              <SelectTrigger>
                <SelectValue placeholder="Validação" />
              </SelectTrigger>
              <SelectContent>
                {validationOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600 flex items-center">
              {filteredDados.length} de {dados.length} registros
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Macro Processo</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Nome da Planilha</TableHead>
                <TableHead>Tipo de Dados</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead>Validação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evidências</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDados.map((dado) => (
                <TableRow key={dado.id}>
                  <TableCell className="font-medium">{dado.macro_processo}</TableCell>
                  <TableCell>{dado.processo_nome}</TableCell>
                  <TableCell>{dado.nome_planilha}</TableCell>
                  <TableCell>{dado.tipo_dados || '-'}</TableCell>
                  <TableCell>{getCriticidadeBadge(dado.criticidade)}</TableCell>
                  <TableCell>{getValidationBadge(dado.validacao_etapa)}</TableCell>
                  <TableCell>
                    <Badge variant={dado.status === 'Ativo' ? 'default' : 'secondary'}>
                      {dado.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dado.evidencia_names && dado.evidencia_names.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{dado.evidencia_names.length}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(dado)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(dado.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {modalOpen && (
        <DadosPlanilhasModal
          open={modalOpen}
          onClose={handleModalClose}
          editingDado={editingDado}
          projectId={selectedProject || ''}
        />
      )}
    </div>
  );
};

export default DadosPlanilhas;