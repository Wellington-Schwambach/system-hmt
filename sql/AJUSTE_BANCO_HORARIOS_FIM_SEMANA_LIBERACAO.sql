-- PostgreSQL
-- Use este arquivo somente se você NÃO for executar `php artisan migrate`.
-- A migration 2026_08_04_000200 realiza o mesmo ajuste automaticamente.

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS saturday_access_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS saturday_start_time TIME NULL,
    ADD COLUMN IF NOT EXISTS saturday_end_time TIME NULL,
    ADD COLUMN IF NOT EXISTS sunday_access_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS sunday_start_time TIME NULL,
    ADD COLUMN IF NOT EXISTS sunday_end_time TIME NULL,
    ADD COLUMN IF NOT EXISTS temporary_access_until TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS temporary_access_ip VARCHAR(45) NULL,
    ADD COLUMN IF NOT EXISTS temporary_access_granted_by BIGINT NULL,
    ADD COLUMN IF NOT EXISTS temporary_access_granted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS users_temporary_access_until_index
    ON users (temporary_access_until);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_temporary_access_granted_by_foreign'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_temporary_access_granted_by_foreign
            FOREIGN KEY (temporary_access_granted_by)
            REFERENCES users(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Preserva regras antigas que usavam 6=sábado e 7=domingo no JSON access_days.
UPDATE users
SET
    saturday_access_enabled = TRUE,
    saturday_start_time = access_start_time,
    saturday_end_time = access_end_time
WHERE COALESCE(access_days::jsonb, '[]'::jsonb) @> '[6]'::jsonb;

UPDATE users
SET
    sunday_access_enabled = TRUE,
    sunday_start_time = access_start_time,
    sunday_end_time = access_end_time
WHERE COALESCE(access_days::jsonb, '[]'::jsonb) @> '[7]'::jsonb;

-- Se uma regra antiga estava ativa sem dias explícitos, mantém segunda a sexta.
UPDATE users
SET access_days = '[1,2,3,4,5]'::json
WHERE access_schedule_enabled = TRUE
  AND access_days IS NULL
  AND access_start_time IS NOT NULL
  AND access_end_time IS NOT NULL;

-- A partir deste ajuste, access_days guarda somente segunda a sexta.
UPDATE users u
SET access_days = COALESCE(
    (
        SELECT json_agg(day_number ORDER BY day_number)
        FROM (
            SELECT DISTINCT value::INTEGER AS day_number
            FROM json_array_elements_text(COALESCE(u.access_days, '[]'::json))
            WHERE value::INTEGER BETWEEN 1 AND 5
        ) weekdays
    ),
    '[]'::json
)
WHERE access_days IS NOT NULL;

-- Corrige registros antigos: somente senha incorreta pode preencher blocked_until.
UPDATE login_attempts
SET blocked_until = NULL
WHERE failure_reason IS DISTINCT FROM 'invalid_credentials';

COMMIT;
