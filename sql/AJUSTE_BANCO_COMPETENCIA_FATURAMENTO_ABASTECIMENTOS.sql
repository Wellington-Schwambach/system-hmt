-- Competência mensal dos abastecimentos.
-- Use este SQL somente se você NÃO for executar `php artisan migrate`.

ALTER TABLE fuel_records
    ADD COLUMN IF NOT EXISTS billing_month DATE;

UPDATE fuel_records
   SET billing_month = date_trunc('month', fuel_date)::date
 WHERE billing_month IS NULL
   AND fuel_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS fuel_records_billing_month_index
    ON fuel_records (billing_month);
