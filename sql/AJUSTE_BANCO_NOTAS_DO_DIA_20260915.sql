-- Notas do dia / preferências de alertas por usuário
-- PostgreSQL
-- Execute este arquivo somente se NÃO for utilizar `php artisan migrate`.

BEGIN;

CREATE TABLE IF NOT EXISTS daily_note_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    days_before SMALLINT NOT NULL DEFAULT 10 CHECK (days_before >= 0 AND days_before <= 365),
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    CONSTRAINT daily_note_preferences_user_type_unique UNIQUE (user_id, alert_type)
);

CREATE INDEX IF NOT EXISTS daily_note_preferences_alert_type_enabled_index
    ON daily_note_preferences (alert_type, enabled);

CREATE TABLE IF NOT EXISTS daily_notes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    observation TEXT NOT NULL,
    scheduled_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    deleted_at TIMESTAMP(0) WITHOUT TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS daily_notes_scheduled_at_index ON daily_notes (scheduled_at);
CREATE INDEX IF NOT EXISTS daily_notes_created_by_index ON daily_notes (created_by);

CREATE TABLE IF NOT EXISTS daily_note_recipients (
    id BIGSERIAL PRIMARY KEY,
    daily_note_id BIGINT NOT NULL REFERENCES daily_notes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    CONSTRAINT daily_note_recipients_note_user_unique UNIQUE (daily_note_id, user_id)
);

CREATE INDEX IF NOT EXISTS daily_note_recipients_user_note_index
    ON daily_note_recipients (user_id, daily_note_id);

COMMIT;
