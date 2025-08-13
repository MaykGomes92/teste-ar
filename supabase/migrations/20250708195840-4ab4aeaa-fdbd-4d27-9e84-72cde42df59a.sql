
-- Adicionar novos campos na tabela melhorias
ALTER TABLE public.melhorias 
ADD COLUMN detalhamento_solucao text,
ADD COLUMN descricao_problema text,
ADD COLUMN tipo_oportunidade text,
ADD COLUMN ponto_risco_controle boolean,
ADD COLUMN esforco text CHECK (esforco IN ('Baixo', 'Médio', 'Alto')),
ADD COLUMN beneficio text CHECK (beneficio IN ('Baixo', 'Médio', 'Alto')),
ADD COLUMN financeiro boolean,
ADD COLUMN reducao_da boolean,
ADD COLUMN produtividade boolean,
ADD COLUMN legal_regulatorio boolean,
ADD COLUMN esforco_beneficio text,
ADD COLUMN priorizacao text,
ADD COLUMN tratativa text,
ADD COLUMN sistema_envolvido boolean,
ADD COLUMN modulo_sistema text,
ADD COLUMN ifrs4 boolean,
ADD COLUMN ifrs17 boolean,
ADD COLUMN potencial_implementacao_imediata boolean,
ADD COLUMN sistema_sera_substituido boolean,
ADD COLUMN novo_sistema text,
ADD COLUMN previsao_implementacao_novo_sistema text,
ADD COLUMN diferenca_sap_s4hanna text,
ADD COLUMN problema_sanado_novo_sistema boolean,
ADD COLUMN necessidade_integracao boolean;

-- Função para calcular automaticamente o esforço benefício
CREATE OR REPLACE FUNCTION public.calculate_esforco_beneficio()
RETURNS TRIGGER AS $$
BEGIN
    -- Combinar esforço e benefício para gerar o valor de esforco_beneficio
    IF NEW.esforco IS NOT NULL AND NEW.beneficio IS NOT NULL THEN
        NEW.esforco_beneficio := NEW.esforco || ' + ' || NEW.beneficio;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular automaticamente o esforço benefício
CREATE TRIGGER trigger_calculate_esforco_beneficio
    BEFORE INSERT OR UPDATE ON public.melhorias
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_esforco_beneficio();
