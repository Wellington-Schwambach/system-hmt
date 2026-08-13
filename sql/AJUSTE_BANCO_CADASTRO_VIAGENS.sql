-- PostgreSQL - Cadastro completo de viagens
-- Execute este SQL somente se você NÃO utilizar: php artisan migrate

CREATE TABLE IF NOT EXISTS travels (
    id BIGSERIAL PRIMARY KEY,
    cte_type VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    travel_date DATE NOT NULL,
    receipt_date DATE NULL,
    origin VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    cte_number VARCHAR(30) NOT NULL,
    cte_series VARCHAR(10) NOT NULL DEFAULT '1',
    shipper VARCHAR(50) NOT NULL,
    operation_type VARCHAR(20) NOT NULL DEFAULT 'FLEET',
    vehicle_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    plate_snapshot VARCHAR(10) NOT NULL,
    driver_one_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    driver_one_name VARCHAR(150) NULL,
    driver_two_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    driver_two_name VARCHAR(150) NULL,
    third_party_name VARCHAR(150) NULL,
    third_party_plate VARCHAR(10) NULL,
    third_party_payout_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    detached_trailer_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    detached_trailer_plate_snapshot VARCHAR(10) NULL,
    net_freight NUMERIC(14,2) NOT NULL,
    insurance_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    toll_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    icms_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    bonus_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    gross_freight NUMERIC(14,2) NOT NULL,
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    CONSTRAINT travels_cte_series_unique UNIQUE (cte_number, cte_series)
);

CREATE INDEX IF NOT EXISTS travels_travel_date_shipper_index ON travels (travel_date, shipper);
CREATE INDEX IF NOT EXISTS travels_plate_snapshot_index ON travels (plate_snapshot);
CREATE INDEX IF NOT EXISTS travels_receipt_date_index ON travels (receipt_date);
CREATE INDEX IF NOT EXISTS travels_driver_one_id_index ON travels (driver_one_id);
CREATE INDEX IF NOT EXISTS travels_driver_two_id_index ON travels (driver_two_id);
