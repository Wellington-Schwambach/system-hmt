-- HMT Transportes - cadastro completo de abastecimentos
-- Execute somente se NÃO for utilizar `php artisan migrate`.

BEGIN;

CREATE TABLE IF NOT EXISTS fuel_records (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    plate VARCHAR(10) NOT NULL,
    driver_name VARCHAR(180) NOT NULL,
    fuel_date DATE NOT NULL,
    station VARCHAR(120) NOT NULL,
    km BIGINT NULL,
    diesel_liters NUMERIC(12,3) NOT NULL,
    diesel_total_value NUMERIC(14,2) NOT NULL,
    arla_liters NUMERIC(12,3) NOT NULL DEFAULT 0,
    arla_total_value NUMERIC(14,2) NOT NULL DEFAULT 0,
    diesel_invoiced BOOLEAN NOT NULL DEFAULT FALSE,
    arla_invoiced BOOLEAN NOT NULL DEFAULT FALSE,
    diesel_invoiced_at TIMESTAMP NULL,
    arla_invoiced_at TIMESTAMP NULL,
    diesel_invoiced_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    arla_invoiced_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    deleted_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS fuel_records_fuel_date_plate_index
    ON fuel_records (fuel_date, plate);

CREATE INDEX IF NOT EXISTS fuel_records_invoice_status_index
    ON fuel_records (diesel_invoiced, arla_invoiced);

COMMIT;
