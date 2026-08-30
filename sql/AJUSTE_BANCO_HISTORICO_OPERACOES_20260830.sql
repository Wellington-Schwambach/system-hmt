-- Ajustes de histórico/soft delete para Combustível, Viagens e Logística.
-- Preferencialmente aplique via: php artisan migrate

ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS trailer_id BIGINT NULL;
ALTER TABLE fuel_records ADD COLUMN IF NOT EXISTS trailer_plate_snapshot VARCHAR(10) NULL;

CREATE TABLE IF NOT EXISTS fuel_record_events (
  id BIGSERIAL PRIMARY KEY,
  fuel_record_id BIGINT NOT NULL,
  action VARCHAR(30) NOT NULL,
  before_data JSONB NULL,
  after_data JSONB NULL,
  user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

ALTER TABLE travels ADD COLUMN IF NOT EXISTS deleted_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE travels ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
CREATE TABLE IF NOT EXISTS travel_events (
  id BIGSERIAL PRIMARY KEY,
  travel_id BIGINT NOT NULL,
  action VARCHAR(30) NOT NULL,
  before_data JSONB NULL,
  after_data JSONB NULL,
  user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS deleted_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE logistics_loads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
