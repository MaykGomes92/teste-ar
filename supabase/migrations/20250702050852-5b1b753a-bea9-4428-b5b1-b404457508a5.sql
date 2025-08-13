-- Atualizar códigos dos controles existentes baseado no padrão CT.RI.XXX.001
DO $$
DECLARE
    control_record RECORD;
    risk_identifier TEXT;
    control_number INT;
    new_code TEXT;
BEGIN
    -- Para cada controle sem código
    FOR control_record IN 
        SELECT k.id, k.nome, k.risco_id, r.codigo as risco_code
        FROM kris k 
        LEFT JOIN riscos r ON k.risco_id = r.id
        WHERE k.codigo IS NULL
    LOOP
        -- Extrair identificador do risco ou gerar das 3 primeiras letras do nome do controle
        IF control_record.risco_code IS NOT NULL THEN
            -- Extrair as 3 letras do meio do código do risco (ex: RI.PRO.FIN.001 -> FIN)
            risk_identifier := split_part(control_record.risco_code, '.', 3);
            IF length(risk_identifier) < 3 THEN
                -- Se não conseguir extrair, usar as 3 primeiras letras do nome do controle
                risk_identifier := upper(substring(regexp_replace(control_record.nome, '[^a-zA-Z]', '', 'g'), 1, 3));
                IF length(risk_identifier) < 3 THEN
                    risk_identifier := lpad(risk_identifier, 3, 'X');
                END IF;
            END IF;
        ELSE
            -- Se não tem risco, usar as 3 primeiras letras do nome do controle
            risk_identifier := upper(substring(regexp_replace(control_record.nome, '[^a-zA-Z]', '', 'g'), 1, 3));
            IF length(risk_identifier) < 3 THEN
                risk_identifier := lpad(risk_identifier, 3, 'X');
            END IF;
        END IF;
        
        -- Encontrar o próximo número sequencial
        SELECT COALESCE(MAX(CAST(split_part(codigo, '.', 4) AS INTEGER)), 0) + 1
        INTO control_number
        FROM kris 
        WHERE codigo LIKE 'CT.RI.' || risk_identifier || '.%';
        
        -- Gerar o novo código
        new_code := 'CT.RI.' || risk_identifier || '.' || lpad(control_number::TEXT, 3, '0');
        
        -- Atualizar o controle
        UPDATE kris 
        SET codigo = new_code 
        WHERE id = control_record.id;
        
        RAISE NOTICE 'Código gerado para controle %: %', control_record.nome, new_code;
    END LOOP;
END $$;