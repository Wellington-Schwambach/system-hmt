-- Henrique Transportes
-- Ajuste manual para PostgreSQL das regras de segurança do login.
-- Recomendado: use "php artisan migrate". Execute este arquivo apenas se
-- sua política exigir alterações manuais no banco.

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS access_schedule_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS access_start_time TIME NULL,
    ADD COLUMN IF NOT EXISTS access_end_time TIME NULL,
    ADD COLUMN IF NOT EXISTS access_days JSON NULL,
    ADD COLUMN IF NOT EXISTS access_timezone VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo';

CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NULL,
    username VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    was_successful BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason VARCHAR(80) NULL,
    failed_attempt_number SMALLINT NULL,
    blocked_until TIMESTAMPTZ NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSON NULL,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL,
    CONSTRAINT login_attempts_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS login_attempts_username_index
    ON login_attempts (username);

CREATE INDEX IF NOT EXISTS login_attempts_ip_address_index
    ON login_attempts (ip_address);

CREATE INDEX IF NOT EXISTS login_attempts_was_successful_index
    ON login_attempts (was_successful);

CREATE INDEX IF NOT EXISTS login_attempts_failure_reason_index
    ON login_attempts (failure_reason);

CREATE INDEX IF NOT EXISTS login_attempts_blocked_until_index
    ON login_attempts (blocked_until);

CREATE INDEX IF NOT EXISTS login_attempts_attempted_at_index
    ON login_attempts (attempted_at);

CREATE INDEX IF NOT EXISTS login_attempts_identity_time_index
    ON login_attempts (username, ip_address, attempted_at);

COMMIT;

-- EXEMPLO: liberar o usuário "operacao" de segunda a sexta, das 07:30 às 18:00.
-- Os dias seguem ISO-8601: 1=segunda, 2=terça, ..., 7=domingo.
--
-- UPDATE users
-- SET access_schedule_enabled = TRUE,
--     access_start_time = '07:30',
--     access_end_time = '18:00',
--     access_days = '[1,2,3,4,5]'::json,
--     access_timezone = 'America/Sao_Paulo',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE username = 'operacao';

-- EXEMPLO: remover a restrição de horário.
--
-- UPDATE users
-- SET access_schedule_enabled = FALSE,
--     access_start_time = NULL,
--     access_end_time = NULL,
--     access_days = NULL,
--     updated_at = CURRENT_TIMESTAMP
-- WHERE username = 'operacao';

-- CONSULTA: últimos acessos e tentativas.
--
-- SELECT id, username, ip_address, was_successful, failure_reason,
--        failed_attempt_number, blocked_until, attempted_at
-- FROM login_attempts
-- ORDER BY attempted_at DESC
-- LIMIT 100;

-- CONSULTA: bloqueios ativos.
--
-- SELECT username, ip_address, failed_attempt_number, blocked_until
-- FROM login_attempts
-- WHERE blocked_until > CURRENT_TIMESTAMP
-- ORDER BY blocked_until DESC;
