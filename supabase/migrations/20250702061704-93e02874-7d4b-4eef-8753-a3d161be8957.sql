-- Criar buckets de storage para arquivos
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('bpmn-diagrams', 'bpmn-diagrams', false),
  ('test-evidences', 'test-evidences', false);

-- Adicionar colunas para armazenar referências aos arquivos
ALTER TABLE public.processos 
ADD COLUMN bpmn_diagram_path TEXT,
ADD COLUMN bpmn_diagram_name TEXT;

ALTER TABLE public.testes 
ADD COLUMN evidencia_paths TEXT[],
ADD COLUMN evidencia_names TEXT[];

-- Políticas de storage para diagramas BPMN
CREATE POLICY "Users can upload BPMN diagrams" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bpmn-diagrams' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their BPMN diagrams" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bpmn-diagrams' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their BPMN diagrams" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bpmn-diagrams' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their BPMN diagrams" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bpmn-diagrams' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de storage para evidências de testes
CREATE POLICY "Users can upload test evidences" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'test-evidences' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their test evidences" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'test-evidences' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their test evidences" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'test-evidences' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their test evidences" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'test-evidences' AND auth.uid()::text = (storage.foldername(name))[1]);