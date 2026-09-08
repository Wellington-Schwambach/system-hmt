-- Ajuste do cadastro da logística:
-- 1) número específico quando o registro for CARGA;
-- 2) múltiplas LOADS (ex.: uma vazia e outra cheia);
-- 3) compatibilidade com registros antigos que já possuíam load_number/load_status.

ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS cargo_number VARCHAR(100);

ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS load_entries JSONB;

-- Registros antigos tinham load_number/load_status antes de existir load_mode.
UPDATE logistics_loads
   SET load_mode = 'LOAD'
 WHERE load_mode IS NULL
   AND (load_number IS NOT NULL OR load_status IS NOT NULL);

-- Preserva registros antigos que usavam load_status/load_number únicos.
UPDATE logistics_loads
   SET load_status = CASE
           WHEN load_status IN ('EMPTY', 'FULL') THEN load_status
           ELSE 'EMPTY'
       END,
       load_entries = jsonb_build_array(
           jsonb_build_object(
               'status', CASE
                   WHEN load_status IN ('EMPTY', 'FULL') THEN load_status
                   ELSE 'EMPTY'
               END,
               'number', load_number
           )
       )
 WHERE load_mode = 'LOAD'
   AND load_entries IS NULL
   AND (load_status IS NOT NULL OR load_number IS NOT NULL);
