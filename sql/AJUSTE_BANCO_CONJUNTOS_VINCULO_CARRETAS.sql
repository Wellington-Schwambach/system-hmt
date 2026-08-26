-- HMT - Módulo de Conjuntos / Vincular Carretas
-- PostgreSQL
-- Execute este arquivo SOMENTE se não utilizar `php artisan migrate`.

BEGIN;

CREATE TABLE IF NOT EXISTS vehicle_sets (
    id BIGSERIAL PRIMARY KEY,
    tractor_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    trailer_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    tractor_plate VARCHAR(7) NOT NULL,
    tractor_label VARCHAR(220) NOT NULL,
    trailer_plate VARCHAR(7) NOT NULL,
    trailer_label VARCHAR(220) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    coupled_at TIMESTAMP NOT NULL,
    driver_assigned_at TIMESTAMP NOT NULL,
    detached_at TIMESTAMP NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS vehicle_sets_status_coupled_idx ON vehicle_sets(status, coupled_at);
CREATE INDEX IF NOT EXISTS vehicle_sets_tractor_status_idx ON vehicle_sets(tractor_id, status);
CREATE INDEX IF NOT EXISTS vehicle_sets_trailer_status_idx ON vehicle_sets(trailer_id, status);
CREATE INDEX IF NOT EXISTS vehicle_sets_driver_status_idx ON vehicle_sets(driver_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS vehicle_sets_active_tractor_unique
    ON vehicle_sets(tractor_id)
    WHERE status = 'ACTIVE' AND tractor_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS vehicle_sets_active_trailer_unique
    ON vehicle_sets(trailer_id)
    WHERE status = 'ACTIVE' AND trailer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS vehicle_sets_active_driver_unique
    ON vehicle_sets(driver_id)
    WHERE status = 'ACTIVE' AND driver_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS vehicle_set_events (
    id BIGSERIAL PRIMARY KEY,
    vehicle_set_id BIGINT NOT NULL REFERENCES vehicle_sets(id) ON DELETE CASCADE,
    action VARCHAR(30) NOT NULL,
    tractor_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    trailer_id BIGINT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
    tractor_plate VARCHAR(7) NOT NULL,
    trailer_plate VARCHAR(7) NOT NULL,
    driver_name VARCHAR(150) NULL,
    occurred_at TIMESTAMP NOT NULL,
    notes TEXT NULL,
    details JSON NULL,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS vehicle_set_events_set_date_idx ON vehicle_set_events(vehicle_set_id, occurred_at);
CREATE INDEX IF NOT EXISTS vehicle_set_events_action_date_idx ON vehicle_set_events(action, occurred_at);

-- Libera o novo menu para perfis operacionais já existentes que tenham permissões persistidas.
UPDATE users
SET menu_permissions = (
    COALESCE(menu_permissions::jsonb, '[]'::jsonb) || '["vehicle_sets"]'::jsonb
)::json
WHERE menu_permissions IS NOT NULL
  AND NOT (COALESCE(menu_permissions::jsonb, '[]'::jsonb) ? 'vehicle_sets')
  AND (
      LOWER(role) IN ('administrador', 'gestor', 'operador')
      OR COALESCE(menu_permissions::jsonb, '[]'::jsonb) ? 'travel'
      OR COALESCE(menu_permissions::jsonb, '[]'::jsonb) ? 'logistics'
  );

COMMIT;
