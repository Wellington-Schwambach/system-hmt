-- Estrutura manual completa do quadro de Logística.
-- Prefira executar: php artisan migrate

CREATE TABLE IF NOT EXISTS logistics_loads (
    id BIGSERIAL PRIMARY KEY,
    reference_code VARCHAR(40) NOT NULL UNIQUE,
    shipment_number VARCHAR(100) NULL,
    load_number VARCHAR(100) NULL,
    shipowner VARCHAR(140) NULL,
    booking_number VARCHAR(100) NULL,
    shipper_id BIGINT NOT NULL REFERENCES shippers(id) ON DELETE RESTRICT,
    driver_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    driver_two_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    tractor_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    trailer_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    container_number VARCHAR(40) NULL, -- legado; não é mais usado na tela
    collection_city VARCHAR(140) NULL, -- legado
    loading_city VARCHAR(140) NULL, -- legado
    delivery_city VARCHAR(140) NULL, -- legado
    collection_terminal VARCHAR(180) NULL,
    collection_at TIMESTAMP NULL,
    loading_location VARCHAR(180) NULL,
    loading_at TIMESTAMP NULL,
    delivery_location VARCHAR(180) NULL,
    delivery_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NOT NULL,
    stage VARCHAR(30) NOT NULL DEFAULT 'PROGRAMMING',
    position INTEGER NOT NULL DEFAULT 0,
    notes TEXT NULL,
    completed_at TIMESTAMP NULL,
    completed_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS logistics_loads_stage_position_idx ON logistics_loads(stage, position);
CREATE INDEX IF NOT EXISTS logistics_loads_scheduled_at_idx ON logistics_loads(scheduled_at);
CREATE INDEX IF NOT EXISTS logistics_loads_shipper_scheduled_idx ON logistics_loads(shipper_id, scheduled_at);
CREATE INDEX IF NOT EXISTS logistics_loads_collection_at_index ON logistics_loads(collection_at);
CREATE INDEX IF NOT EXISTS logistics_loads_loading_at_index ON logistics_loads(loading_at);
CREATE INDEX IF NOT EXISTS logistics_loads_delivery_at_index ON logistics_loads(delivery_at);
CREATE INDEX IF NOT EXISTS logistics_loads_completed_at_index ON logistics_loads(completed_at);
CREATE INDEX IF NOT EXISTS logistics_loads_status_stage_position_idx ON logistics_loads(completed_at, stage, position);

CREATE TABLE IF NOT EXISTS logistics_load_events (
    id BIGSERIAL PRIMARY KEY,
    logistics_load_id BIGINT NOT NULL REFERENCES logistics_loads(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL,
    from_stage VARCHAR(30) NULL,
    to_stage VARCHAR(30) NULL,
    details JSONB NULL,
    occurred_at TIMESTAMP NOT NULL,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS logistics_load_events_load_time_idx ON logistics_load_events(logistics_load_id, occurred_at);
