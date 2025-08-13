-- Adicionar campos de código para identificação alfanumérica
ALTER TABLE public.macro_processos ADD COLUMN codigo TEXT;
ALTER TABLE public.processos ADD COLUMN codigo TEXT;
ALTER TABLE public.riscos ADD COLUMN codigo TEXT;
ALTER TABLE public.kris ADD COLUMN codigo TEXT;
ALTER TABLE public.testes ADD COLUMN codigo TEXT;
ALTER TABLE public.melhorias ADD COLUMN codigo TEXT;

-- Criar índices únicos para os códigos
CREATE UNIQUE INDEX idx_macro_processos_codigo ON public.macro_processos(codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX idx_processos_codigo ON public.processos(codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX idx_riscos_codigo ON public.riscos(codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX idx_kris_codigo ON public.kris(codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX idx_testes_codigo ON public.testes(codigo) WHERE codigo IS NOT NULL;
CREATE UNIQUE INDEX idx_melhorias_codigo ON public.melhorias(codigo) WHERE codigo IS NOT NULL;