-- Henrique Transportes
-- Reparo de compatibilidade dos modos Frota própria e Terceiro contratado.
-- Execute somente se NÃO utilizar: php artisan migrate

BEGIN;

ALTER TABLE travels ALTER COLUMN vehicle_id DROP NOT NULL;
ALTER TABLE travels ALTER COLUMN driver_one_id DROP NOT NULL;
ALTER TABLE travels ALTER COLUMN driver_two_id DROP NOT NULL;
ALTER TABLE travels ALTER COLUMN third_party_name DROP NOT NULL;
ALTER TABLE travels ALTER COLUMN third_party_plate DROP NOT NULL;
ALTER TABLE travels ALTER COLUMN third_party_payout_amount SET DEFAULT 0;
ALTER TABLE travels ALTER COLUMN shipper TYPE VARCHAR(100);

ALTER TABLE travels DROP CONSTRAINT IF EXISTS travels_cte_number_cte_series_unique;
ALTER TABLE travels DROP CONSTRAINT IF EXISTS travels_cte_series_unique;
CREATE INDEX IF NOT EXISTS travels_cte_number_cte_series_index
    ON travels (cte_number, cte_series);

UPDATE travels
SET vehicle_id = NULL,
    driver_one_id = NULL,
    driver_one_name = NULL,
    driver_two_id = NULL,
    driver_two_name = NULL
WHERE operation_type = 'THIRD_PARTY';

UPDATE travels
SET third_party_name = NULL,
    third_party_plate = NULL,
    third_party_payout_amount = 0
WHERE operation_type = 'FLEET';

COMMIT;
