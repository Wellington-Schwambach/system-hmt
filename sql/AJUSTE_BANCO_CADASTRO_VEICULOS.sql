-- Execute somente se você NÃO for usar: php artisan migrate
-- PostgreSQL - Cadastro completo de veículos

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    fleet_number VARCHAR(30) UNIQUE,
    plate VARCHAR(7) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacture_year SMALLINT NOT NULL,
    model_year SMALLINT NOT NULL,
    color VARCHAR(50),
    chassis VARCHAR(17) UNIQUE,
    renavam VARCHAR(11) UNIQUE,
    fuel_type VARCHAR(20) NOT NULL DEFAULT 'DIESEL',
    load_capacity_kg BIGINT NOT NULL DEFAULT 0,
    tare_kg BIGINT NOT NULL DEFAULT 0,
    current_km BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    opentech_expiry_date DATE,
    angellira_expiry_date DATE,
    licensing_expiry_date DATE,
    notes TEXT,
    crlv_path VARCHAR(255),
    crlv_original_name VARCHAR(255),
    crlv_mime_type VARCHAR(100),
    crlv_size BIGINT,
    crlv_valid_until DATE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT vehicles_type_check CHECK (type IN ('TRACTOR', 'TRAILER')),
    CONSTRAINT vehicles_status_check CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'INACTIVE')),
    CONSTRAINT vehicles_year_check CHECK (model_year >= manufacture_year)
);

CREATE INDEX IF NOT EXISTS vehicles_status_plate_index
    ON vehicles (status, plate);
CREATE INDEX IF NOT EXISTS vehicles_opentech_expiry_date_index
    ON vehicles (opentech_expiry_date);
CREATE INDEX IF NOT EXISTS vehicles_angellira_expiry_date_index
    ON vehicles (angellira_expiry_date);
CREATE INDEX IF NOT EXISTS vehicles_licensing_expiry_date_index
    ON vehicles (licensing_expiry_date);
