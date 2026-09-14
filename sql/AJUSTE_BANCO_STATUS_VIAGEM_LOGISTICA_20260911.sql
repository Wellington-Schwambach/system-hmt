CREATE TABLE IF NOT EXISTS logistics_load_status_notes (
    id BIGSERIAL PRIMARY KEY,
    logistics_load_id BIGINT NOT NULL REFERENCES logistics_loads(id) ON DELETE CASCADE,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    observation TEXT NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS logistics_load_status_notes_load_created_idx
    ON logistics_load_status_notes (logistics_load_id, created_at);
