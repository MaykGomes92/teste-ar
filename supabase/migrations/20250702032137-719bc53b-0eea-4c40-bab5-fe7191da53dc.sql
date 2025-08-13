-- Create tables for the new hierarchical structure

-- Table for Value Chain Structures (Estrutura da Cadeia de Valor)
CREATE TABLE IF NOT EXISTS public.estruturas_cadeia_valor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  cor TEXT DEFAULT 'blue',
  project_info_id UUID REFERENCES public.project_info(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for Macro Processes (Macro Processos) 
CREATE TABLE IF NOT EXISTS public.macro_processos (
  id TEXT NOT NULL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  estrutura_id UUID REFERENCES public.estruturas_cadeia_valor(id),
  project_info_id UUID REFERENCES public.project_info(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add macro_processo_id to existing processos table
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS macro_processo_id TEXT REFERENCES public.macro_processos(id);

-- Enable RLS on new tables
ALTER TABLE public.estruturas_cadeia_valor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macro_processos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for estruturas_cadeia_valor
CREATE POLICY "Users can view structures in their projects" 
ON public.estruturas_cadeia_valor 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = estruturas_cadeia_valor.project_info_id 
  AND pu.user_id = auth.uid()
));

CREATE POLICY "Project users can manage structures" 
ON public.estruturas_cadeia_valor 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = estruturas_cadeia_valor.project_info_id 
  AND pu.user_id = auth.uid() 
  AND pu.role IN ('admin', 'manager', 'user')
));

-- Create RLS policies for macro_processos
CREATE POLICY "Users can view macro processes in their projects" 
ON public.macro_processos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = macro_processos.project_info_id 
  AND pu.user_id = auth.uid()
));

CREATE POLICY "Project users can manage macro processes" 
ON public.macro_processos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.project_users pu 
  WHERE pu.project_id = macro_processos.project_info_id 
  AND pu.user_id = auth.uid() 
  AND pu.role IN ('admin', 'manager', 'user')
));

-- Insert default value chain structures for existing projects
INSERT INTO public.estruturas_cadeia_valor (nome, descricao, ordem, cor, project_info_id)
SELECT 
  'Processos Primários',
  'Atividades principais da cadeia de valor',
  1,
  'blue',
  pi.id
FROM public.project_info pi
WHERE NOT EXISTS (
  SELECT 1 FROM public.estruturas_cadeia_valor ecv 
  WHERE ecv.project_info_id = pi.id AND ecv.nome = 'Processos Primários'
);

INSERT INTO public.estruturas_cadeia_valor (nome, descricao, ordem, cor, project_info_id)
SELECT 
  'Processos de Apoio',
  'Atividades de suporte aos processos primários',
  2,
  'green',
  pi.id
FROM public.project_info pi
WHERE NOT EXISTS (
  SELECT 1 FROM public.estruturas_cadeia_valor ecv 
  WHERE ecv.project_info_id = pi.id AND ecv.nome = 'Processos de Apoio'
);

INSERT INTO public.estruturas_cadeia_valor (nome, descricao, ordem, cor, project_info_id)
SELECT 
  'Processos de Gestão',
  'Atividades de direção e controle',
  3,
  'purple',
  pi.id
FROM public.project_info pi
WHERE NOT EXISTS (
  SELECT 1 FROM public.estruturas_cadeia_valor ecv 
  WHERE ecv.project_info_id = pi.id AND ecv.nome = 'Processos de Gestão'
);

-- Create function to generate automatic codes
CREATE OR REPLACE FUNCTION public.generate_code(
  prefix TEXT,
  process_prefix TEXT,
  table_name TEXT,
  project_id UUID DEFAULT NULL
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_number INTEGER;
  new_code TEXT;
BEGIN
  -- Get the next sequential number for this prefix and process
  EXECUTE format('
    SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM %L) AS INTEGER)), 0) + 1
    FROM %I 
    WHERE id LIKE %L
    AND ($1 IS NULL OR project_info_id = $1)',
    '(\d+)$',
    table_name,
    prefix || process_prefix || '-%'
  ) INTO next_number USING project_id;
  
  -- Format the code with zero padding
  new_code := prefix || process_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN new_code;
END;
$$;