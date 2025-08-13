-- Adicionar triggers que estavam faltando
CREATE TRIGGER trigger_update_riscos_updated_at
    BEFORE UPDATE ON public.riscos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_calculated_impact_insert
    BEFORE INSERT ON public.riscos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_calculated_impact();

CREATE TRIGGER trigger_update_calculated_impact_update
    BEFORE UPDATE ON public.riscos
    FOR EACH ROW
    WHEN (OLD.categorias_pontuacao IS DISTINCT FROM NEW.categorias_pontuacao)
    EXECUTE FUNCTION public.update_calculated_impact();

CREATE TRIGGER trigger_log_risk_status_change
    AFTER UPDATE ON public.riscos
    FOR EACH ROW
    EXECUTE FUNCTION public.log_risk_status_change();

CREATE TRIGGER trigger_log_process_status_change
    AFTER UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.log_process_status_change();

CREATE TRIGGER trigger_update_melhorias_updated_at
    BEFORE UPDATE ON public.melhorias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_calculate_esforco_beneficio
    BEFORE INSERT OR UPDATE ON public.melhorias
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_esforco_beneficio();