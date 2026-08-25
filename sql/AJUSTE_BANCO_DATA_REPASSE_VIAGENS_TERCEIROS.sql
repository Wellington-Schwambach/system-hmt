-- HMT Transportes
-- Adiciona a data em que o repasse do frete terceirizado foi realizado.
-- Use este SQL apenas se NÃO executar `php artisan migrate`.

BEGIN;

ALTER TABLE travels
    ADD COLUMN IF NOT EXISTS third_party_payout_date DATE;

COMMIT;
