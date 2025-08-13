import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Edit, Eye, Trash2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuditTemplatesProps {
  selectedProjectId?: string;
  onRefreshCounts?: () => void;
}

const AuditTemplates = ({ selectedProjectId, onRefreshCounts }: AuditTemplatesProps) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    audit_type: 'desenho',
    methodology: '',
    procedures: [],
    required_evidences: [],
    estimated_hours: '',
    periodicity: 'Trimestral'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedProjectId) {
      fetchTemplates();
    }
  }, [selectedProjectId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_process_templates')
        .select('*')
        .eq('project_info_id', selectedProjectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const templateData = {
        project_info_id: selectedProjectId,
        name: formData.name,
        description: formData.description,
        audit_type: formData.audit_type as 'desenho' | 'efetividade',
        methodology: formData.methodology,
        procedures: formData.procedures,
        required_evidences: formData.required_evidences,
        estimated_hours: parseInt(formData.estimated_hours) || null,
        periodicity: formData.periodicity,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let error;
      if (editingTemplate) {
        const { error: updateError } = await supabase
          .from('audit_process_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('audit_process_templates')
          .insert(templateData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Template ${editingTemplate ? 'atualizado' : 'criado'} com sucesso!`,
      });

      setModalOpen(false);
      resetForm();
      fetchTemplates();
      onRefreshCounts?.();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o template",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      audit_type: template.audit_type,
      methodology: template.methodology,
      procedures: template.procedures || [],
      required_evidences: template.required_evidences || [],
      estimated_hours: template.estimated_hours?.toString() || '',
      periodicity: template.periodicity || 'Trimestral'
    });
    setModalOpen(true);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('audit_process_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso!",
      });

      fetchTemplates();
      onRefreshCounts?.();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o template",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      audit_type: 'desenho',
      methodology: '',
      procedures: [],
      required_evidences: [],
      estimated_hours: '',
      periodicity: 'Trimestral'
    });
  };

  const getAuditTypeColor = (type: string) => {
    switch (type) {
      case "desenho": return "bg-purple-100 text-purple-800 border-purple-200";
      case "efetividade": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPeriodicityColor = (periodicity: string) => {
    switch (periodicity) {
      case "Mensal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Trimestral": return "bg-green-100 text-green-800 border-green-200";
      case "Semestral": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Anual": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Templates de Processos</h2>
            <p className="text-slate-600">Modelos padronizados para execução de testes de auditoria</p>
          </div>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => (
          <Card key={template.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getAuditTypeColor(template.audit_type)}>
                      {template.audit_type === 'desenho' ? 'Teste de Desenho' : 'Teste de Efetividade'}
                    </Badge>
                    <Badge className={getPeriodicityColor(template.periodicity)}>
                      {template.periodicity}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm line-clamp-3">
                {template.description || 'Sem descrição'}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">
                    {template.estimated_hours ? `${template.estimated_hours}h estimadas` : 'Tempo não definido'}
                  </span>
                </div>
                
                {template.procedures && template.procedures.length > 0 && (
                  <div className="text-slate-600">
                    <strong>Procedimentos:</strong> {template.procedures.length} definidos
                  </div>
                )}
                
                {template.required_evidences && template.required_evidences.length > 0 && (
                  <div className="text-slate-600">
                    <strong>Evidências:</strong> {template.required_evidences.length} requeridas
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <Card className="bg-white shadow-lg">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-slate-500 mb-6">
              Crie seu primeiro template de processo de auditoria para padronizar seus testes.
            </p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Template */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template de Processo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="audit_type">Tipo de Teste *</Label>
                <Select value={formData.audit_type} onValueChange={(value) => setFormData({...formData, audit_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desenho">Teste de Desenho</SelectItem>
                    <SelectItem value="efetividade">Teste de Efetividade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="periodicity">Periodicidade</Label>
                <Select value={formData.periodicity} onValueChange={(value) => setFormData({...formData, periodicity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="1"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="methodology">Metodologia *</Label>
              <Textarea
                id="methodology"
                value={formData.methodology}
                onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                rows={4}
                required
                placeholder="Descreva a metodologia a ser seguida neste tipo de teste..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {editingTemplate ? 'Atualizar' : 'Criar'} Template
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTemplates;