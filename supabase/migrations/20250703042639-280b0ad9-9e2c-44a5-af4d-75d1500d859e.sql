-- Add support for multiple process attachments
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS attachment_names TEXT[],
ADD COLUMN IF NOT EXISTS attachment_paths TEXT[],
ADD COLUMN IF NOT EXISTS attachment_dates TIMESTAMP WITH TIME ZONE[];

-- Update existing records to migrate single BPMN to array format
UPDATE public.processos 
SET 
  attachment_names = CASE 
    WHEN bpmn_diagram_name IS NOT NULL THEN ARRAY[bpmn_diagram_name]
    ELSE NULL 
  END,
  attachment_paths = CASE 
    WHEN bpmn_diagram_path IS NOT NULL THEN ARRAY[bpmn_diagram_path]
    ELSE NULL 
  END,
  attachment_dates = CASE 
    WHEN bpmn_diagram_name IS NOT NULL THEN ARRAY[updated_at]
    ELSE NULL 
  END
WHERE bpmn_diagram_name IS NOT NULL;