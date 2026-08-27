-- Ajuste da tela de Logística: campos operacionais, datas por etapa e finalização.
-- Preferencialmente execute via: php artisan migrate

ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS shipment_number VARCHAR(100);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS load_number VARCHAR(100);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS shipowner VARCHAR(140);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS booking_number VARCHAR(100);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS collection_terminal VARCHAR(180);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS collection_at TIMESTAMP NULL;
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS loading_location VARCHAR(180);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS loading_at TIMESTAMP NULL;
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(180);
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS delivery_at TIMESTAMP NULL;
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS completed_by BIGINT NULL;

UPDATE logistics_loads
SET collection_terminal = COALESCE(collection_terminal, collection_city),
    loading_location = COALESCE(loading_location, loading_city),
    delivery_location = COALESCE(delivery_location, delivery_city);

CREATE INDEX IF NOT EXISTS logistics_loads_collection_at_index ON logistics_loads (collection_at);
CREATE INDEX IF NOT EXISTS logistics_loads_loading_at_index ON logistics_loads (loading_at);
CREATE INDEX IF NOT EXISTS logistics_loads_delivery_at_index ON logistics_loads (delivery_at);
CREATE INDEX IF NOT EXISTS logistics_loads_completed_at_index ON logistics_loads (completed_at);
CREATE INDEX IF NOT EXISTS logistics_loads_status_stage_position_idx ON logistics_loads (completed_at, stage, position);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'logistics_loads_completed_by_foreign'
    ) THEN
        ALTER TABLE logistics_loads
        ADD CONSTRAINT logistics_loads_completed_by_foreign
        FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;
