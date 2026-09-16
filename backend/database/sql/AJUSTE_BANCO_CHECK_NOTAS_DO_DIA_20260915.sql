-- Check de conclusão das Notas do dia / alertas
-- Execute este SQL somente se não utilizar: php artisan migrate

CREATE TABLE IF NOT EXISTS daily_note_completions (
    id BIGSERIAL PRIMARY KEY,
    note_key VARCHAR(255) NOT NULL UNIQUE,
    completed_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS daily_note_completions_completed_at_completed_by_index
    ON daily_note_completions (completed_at, completed_by);
