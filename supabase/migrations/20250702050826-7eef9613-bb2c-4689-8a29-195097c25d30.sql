-- Atualizar códigos dos riscos existentes baseado no padrão RI.PRO.XXX.001
DO $$
DECLARE
    risk_record RECORD;
    process_identifier TEXT;
    risk_number INT;
    new_code TEXT;
BEGIN
    -- Para cada risco sem código
    FOR risk_record IN 
        SELECT r.id, r.nome, r.processo_id, p.id as processo_code
        FROM riscos r 
        LEFT JOIN processos p ON r.processo_id = p.id
        WHERE r.codigo IS NULL
    LOOP
        -- Extrair identificador do processo ou gerar das 3 primeiras letras do nome do risco
        IF risk_record.processo_code IS NOT NULL THEN
            -- Extrair as 3 letras do meio do código do processo (ex: PRO.FIN.001 -> FIN)
            process_identifier := split_part(risk_record.processo_code, '.', 2);
            IF length(process_identifier) < 3 THEN
                -- Se não conseguir extrair, usar as 3 primeiras letras do nome do risco
                process_identifier := upper(substring(regexp_replace(risk_record.nome, '[^a-zA-Z]', '', 'g'), 1, 3));
                IF length(process_identifier) < 3 THEN
                    process_identifier := lpad(process_identifier, 3, 'X');
                END IF;
            END IF;
        ELSE
            -- Se não tem processo, usar as 3 primeiras letras do nome do risco
            process_identifier := upper(substring(regexp_replace(risk_record.nome, '[^a-zA-Z]', '', 'g'), 1, 3));
            IF length(process_identifier) < 3 THEN
                process_identifier := lpad(process_identifier, 3, 'X');
            END IF;
        END IF;
        
        -- Encontrar o próximo número sequencial
        SELECT COALESCE(MAX(CAST(split_part(codigo, '.', 4) AS INTEGER)), 0) + 1
        INTO risk_number
        FROM riscos 
        WHERE codigo LIKE 'RI.PRO.' || process_identifier || '.%';
        
        -- Gerar o novo código
        new_code := 'RI.PRO.' || process_identifier || '.' || lpad(risk_number::TEXT, 3, '0');
        
        -- Atualizar o risco
        UPDATE riscos 
        SET codigo = new_code 
        WHERE id = risk_record.id;
        
        RAISE NOTICE 'Código gerado para risco %: %', risk_record.nome, new_code;
    END LOOP;
END $$;