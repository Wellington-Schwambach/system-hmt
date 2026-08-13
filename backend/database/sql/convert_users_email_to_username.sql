-- PostgreSQL: converte o login de e-mail para usuário sem alterar as senhas.
-- A migration do Laravel já executa esta conversão automaticamente.
-- Use este arquivo apenas se quiser fazer o ajuste manualmente pelo banco.

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(100);

WITH prepared AS (
    SELECT
        id,
        COALESCE(
            NULLIF(
                TRIM(BOTH '._-' FROM REGEXP_REPLACE(
                    LOWER(SPLIT_PART(COALESCE(email, ''), '@', 1)),
                    '[^a-z0-9._-]+',
                    '',
                    'g'
                )),
                ''
            ),
            'usuario' || id::TEXT
        ) AS base_username
    FROM users
), ranked AS (
    SELECT
        id,
        base_username,
        ROW_NUMBER() OVER (PARTITION BY base_username ORDER BY id) AS occurrence
    FROM prepared
)
UPDATE users AS target
SET username = CASE
    WHEN ranked.occurrence = 1 THEN LEFT(ranked.base_username, 100)
    ELSE LEFT(ranked.base_username, 90) || '_' || ranked.occurrence
END
FROM ranked
WHERE target.id = ranked.id
  AND (target.username IS NULL OR BTRIM(target.username) = '');

ALTER TABLE users
    ALTER COLUMN username SET NOT NULL;

ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_email_unique;

DROP INDEX IF EXISTS users_email_unique;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique
    ON users (LOWER(username));

ALTER TABLE users
    DROP COLUMN IF EXISTS email_verified_at,
    DROP COLUMN IF EXISTS email;

DROP TABLE IF EXISTS password_reset_tokens;

COMMIT;

-- Exemplo para trocar o usuário do administrador depois da conversão:
-- UPDATE users SET username = 'admin' WHERE id = 1;
