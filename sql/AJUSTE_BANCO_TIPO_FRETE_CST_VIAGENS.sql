-- Tipo de frete e CST no lançamento de viagens
ALTER TABLE travels
    ADD COLUMN IF NOT EXISTS freight_type VARCHAR(30),
    ADD COLUMN IF NOT EXISTS cst VARCHAR(2);

COMMENT ON COLUMN travels.freight_type IS 'CABOTAGE, EXPORT_PORT ou OTHER';
COMMENT ON COLUMN travels.cst IS 'CST selecionada no lançamento: 00, 90, 60, 41, 40, 51 ou 20';
