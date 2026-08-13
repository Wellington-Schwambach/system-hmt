BEGIN;

CREATE TABLE IF NOT EXISTS shippers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    normalized_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS shippers_normalized_name_unique
    ON shippers (normalized_name);
CREATE INDEX IF NOT EXISTS shippers_status_name_index
    ON shippers (status, name);

ALTER TABLE travels
    ADD COLUMN IF NOT EXISTS shipper_id BIGINT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'travels_shipper_id_foreign'
    ) THEN
        ALTER TABLE travels
            ADD CONSTRAINT travels_shipper_id_foreign
            FOREIGN KEY (shipper_id)
            REFERENCES shippers(id)
            ON DELETE SET NULL;
    END IF;
END $$;

INSERT INTO shippers (name, normalized_name, status, created_at, updated_at)
VALUES
    ('BRF', 'BRF', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Aurora', 'AURORA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Milia', 'MILIA', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('GEO', 'GEO', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Itracon', 'ITRACON', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (normalized_name) DO NOTHING;

INSERT INTO shippers (name, normalized_name, status, created_at, updated_at)
SELECT DISTINCT
    TRIM(t.shipper),
    UPPER(TRIM(t.shipper)),
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM travels t
WHERE t.shipper IS NOT NULL
  AND TRIM(t.shipper) <> ''
ON CONFLICT (normalized_name) DO NOTHING;

UPDATE travels t
SET shipper_id = s.id
FROM shippers s
WHERE t.shipper_id IS NULL
  AND UPPER(TRIM(t.shipper)) = s.normalized_name;

COMMIT;
