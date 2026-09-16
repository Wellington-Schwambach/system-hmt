-- Alertas personalizados / Notas do dia
-- Execute somente se não for usar "php artisan migrate".

ALTER TABLE daily_notes
    ADD COLUMN IF NOT EXISTS note_type VARCHAR(20) NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS days_before SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS daily_notes_note_type_is_active_index
    ON daily_notes (note_type, is_active);
