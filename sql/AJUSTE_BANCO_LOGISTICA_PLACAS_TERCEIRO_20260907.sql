-- Logística: permitir placas de frota própria ou placas descritas de terceiro.
ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS plate_mode VARCHAR(20) NOT NULL DEFAULT 'FLEET';

ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS third_party_tractor_plate VARCHAR(40) NULL;

ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS third_party_trailer_plate VARCHAR(40) NULL;

-- Registros anteriores permanecem como frota própria.
UPDATE logistics_loads
   SET plate_mode = 'FLEET'
 WHERE plate_mode IS NULL OR TRIM(plate_mode) = '';
