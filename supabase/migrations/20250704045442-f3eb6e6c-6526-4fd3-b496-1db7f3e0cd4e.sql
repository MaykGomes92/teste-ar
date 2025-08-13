-- Verificar estrutura da tabela riscos e atualizar para suportar múltiplas categorias com pontuação
-- Adicionar colunas para categorias com pontuação e impacto calculado automaticamente

-- Adicionar coluna para armazenar categorias com pontuação (JSON)
ALTER TABLE public.riscos 
ADD COLUMN IF NOT EXISTS categorias_pontuacao JSONB DEFAULT '{}';

-- Adicionar coluna para impacto calculado automaticamente
ALTER TABLE public.riscos 
ADD COLUMN IF NOT EXISTS impacto_calculado INTEGER DEFAULT 0;

-- Criar função para calcular impacto automaticamente baseado na pontuação máxima das categorias
CREATE OR REPLACE FUNCTION calculate_max_impact_from_categories(categorias_pontuacao JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    max_score INTEGER := 0;
    current_score INTEGER;
    category_key TEXT;
BEGIN
    -- Iterar sobre todas as categorias no JSON
    FOR category_key IN SELECT jsonb_object_keys(categorias_pontuacao)
    LOOP
        current_score := (categorias_pontuacao ->> category_key)::INTEGER;
        IF current_score > max_score THEN
            max_score := current_score;
        END IF;
    END LOOP;
    
    RETURN max_score;
END;
$$;

-- Criar trigger para atualizar automaticamente o impacto calculado
CREATE OR REPLACE FUNCTION update_calculated_impact()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.impacto_calculado := calculate_max_impact_from_categories(NEW.categorias_pontuacao);
    RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela de riscos
DROP TRIGGER IF EXISTS trigger_update_calculated_impact ON public.riscos;
CREATE TRIGGER trigger_update_calculated_impact
    BEFORE INSERT OR UPDATE OF categorias_pontuacao ON public.riscos
    FOR EACH ROW
    EXECUTE FUNCTION update_calculated_impact();