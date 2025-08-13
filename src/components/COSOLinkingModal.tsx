import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface COSOLinkingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceType: 'processo' | 'risco' | 'kri' | 'controle';
  sourceId: string;
  targetType: 'risco' | 'kri' | 'controle' | 'teste';
  selectedProject?: string;
}

const COSOLinkingModal = ({ 
  open, 
  onOpenChange, 
  sourceType, 
  sourceId, 
  targetType, 
  selectedProject 
}: COSOLinkingModalProps) => {
  const [availableTargets, setAvailableTargets] = useState([]);
  const [linkedTargets, setLinkedTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && selectedProject) {
      fetchAvailableTargets();
      fetchLinkedTargets();
    }
  }, [open, selectedProject, sourceId, targetType]);

  const fetchAvailableTargets = async () => {
    try {
      setLoading(true);
      let query;
      
      switch (targetType) {
        case 'risco':
          query = supabase
            .from('riscos')
            .select('id, nome, codigo, categoria')
            .eq('project_info_id', selectedProject);
          break;
        case 'kri':
          query = supabase
            .from('kris')
            .select('id, nome, codigo, categoria')
            .eq('project_info_id', selectedProject);
          break;
        case 'controle':
          query = supabase
            .from('kris')
            .select('id, nome, codigo, categoria')
            .eq('project_info_id', selectedProject)
            .eq('categoria', 'Controle');
          break;
        case 'teste':
          query = supabase
            .from('testes')
            .select('id, nome, codigo, maturidade')
            .eq('project_info_id', selectedProject);
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setAvailableTargets(data || []);
    } catch (error) {
      console.error('Erro ao buscar targets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os itens disponíveis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedTargets = async () => {
    try {
      // Buscar relacionamentos existentes baseado no tipo de origem
      let linkedData = [];
      
      switch (sourceType) {
        case 'processo':
          if (targetType === 'risco') {
            const { data } = await supabase
              .from('riscos')
              .select('*')
              .eq('processo_id', sourceId);
            linkedData = data || [];
          }
          break;
        case 'risco':
          if (targetType === 'kri') {
            const { data } = await supabase
              .from('kris')
              .select('*')
              .eq('risco_id', sourceId);
            linkedData = data || [];
          }
          break;
      }
      
      setLinkedTargets(linkedData);
    } catch (error) {
      console.error('Erro ao buscar links existentes:', error);
    }
  };

  const handleCreateLink = async () => {
    if (!selectedTarget) return;

    try {
      let result;

      switch (targetType) {
        case 'risco':
          result = await supabase
            .from('riscos')
            .update({ processo_id: sourceId })
            .eq('id', selectedTarget);
          break;
        case 'kri':
          if (sourceType === 'risco') {
            result = await supabase
              .from('kris')
              .update({ risco_id: sourceId })
              .eq('id', selectedTarget);
          } else if (sourceType === 'processo') {
            result = await supabase
              .from('kris')
              .update({ processo_id: sourceId })
              .eq('id', selectedTarget);
          }
          break;
        case 'controle':
          if (sourceType === 'risco') {
            result = await supabase
              .from('kris')
              .update({ risco_id: sourceId })
              .eq('id', selectedTarget);
          }
          break;
        case 'teste':
          if (sourceType === 'controle') {
            result = await supabase
              .from('testes')
              .update({ controle_id: sourceId })
              .eq('id', selectedTarget);
          } else if (sourceType === 'risco') {
            result = await supabase
              .from('testes')
              .update({ risco_id: sourceId })
              .eq('id', selectedTarget);
          }
          break;
      }

      if (result?.error) throw result.error;

      toast({
        title: "Sucesso",
        description: "Relacionamento criado com sucesso!",
      });

      setSelectedTarget('');
      fetchLinkedTargets();
      fetchAvailableTargets();
    } catch (error) {
      console.error('Erro ao criar link:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o relacionamento",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      processo: 'Processo',
      risco: 'Risco',
      kri: 'KRI',
      controle: 'Controle',
      teste: 'Teste'
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Vincular {getTypeLabel(sourceType)} → {getTypeLabel(targetType)}
          </DialogTitle>
          <DialogDescription>
            Estabeleça relacionamentos entre os componentes seguindo a metodologia COSO
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Criar Novo Vínculo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criar Novo Vínculo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Selecione um ${getTypeLabel(targetType).toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets
                        .filter(target => !linkedTargets.some(linked => linked.id === target.id))
                        .map(target => (
                        <SelectItem key={target.id} value={target.id}>
                          {target.codigo ? `${target.codigo} - ` : ''}{target.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateLink}
                  disabled={!selectedTarget || loading}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Vincular
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vínculos Existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Vínculos Existentes ({linkedTargets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedTargets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria/Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedTargets.map(target => (
                      <TableRow key={target.id}>
                        <TableCell className="font-mono">
                          {target.codigo || `${getTypeLabel(targetType).substring(0,2).toUpperCase()}-${target.id.substring(0,8)}`}
                        </TableCell>
                        <TableCell>{target.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {target.categoria || target.status || target.maturidade || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Desvincular
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum vínculo estabelecido ainda</p>
                  <p className="text-sm">Use o formulário acima para criar relacionamentos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default COSOLinkingModal;