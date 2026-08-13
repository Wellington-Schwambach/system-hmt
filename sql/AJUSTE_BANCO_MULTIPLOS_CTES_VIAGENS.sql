-- Henrique Transportes
-- Ajuste do módulo de Viagens para permitir vários CT-es por viagem.
-- PostgreSQL
--
-- NÃO execute este arquivo se você já executar:
--   php artisan migrate
--
-- A migration Laravel equivalente é:
--   2026_08_13_170000_create_travel_ctes_table.php

BEGIN;

CREATE TABLE IF NOT EXISTS travel_ctes (
    id BIGSERIAL PRIMARY KEY,
    travel_id BIGINT NOT NULL,
    cte_type VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    cte_number VARCHAR(30) NOT NULL,
    cte_series VARCHAR(10) NOT NULL DEFAULT '1',
    net_freight NUMERIC(14,2) NOT NULL,
    insurance_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    toll_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    icms_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    bonus_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    gross_freight NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_constraint
         WHERE conname = 'travel_ctes_travel_id_foreign'
    ) THEN
        ALTER TABLE travel_ctes
            ADD CONSTRAINT travel_ctes_travel_id_foreign
            FOREIGN KEY (travel_id)
            REFERENCES travels(id)
            ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM pg_constraint
         WHERE conname = 'travel_ctes_cte_number_cte_series_unique'
    ) THEN
        ALTER TABLE travel_ctes
            ADD CONSTRAINT travel_ctes_cte_number_cte_series_unique
            UNIQUE (cte_number, cte_series);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS travel_ctes_travel_id_cte_type_index
    ON travel_ctes (travel_id, cte_type);

-- Converte automaticamente cada viagem já existente em um primeiro CT-e filho.
INSERT INTO travel_ctes (
    travel_id,
    cte_type,
    cte_number,
    cte_series,
    net_freight,
    insurance_amount,
    toll_amount,
    icms_amount,
    bonus_amount,
    gross_freight,
    created_at,
    updated_at
)
SELECT
    t.id,
    COALESCE(NULLIF(t.cte_type, ''), 'NORMAL'),
    t.cte_number,
    COALESCE(NULLIF(t.cte_series, ''), '1'),
    t.net_freight,
    COALESCE(t.insurance_amount, 0),
    COALESCE(t.toll_amount, 0),
    COALESCE(t.icms_amount, 0),
    COALESCE(t.bonus_amount, 0),
    t.gross_freight,
    t.created_at,
    t.updated_at
FROM travels t
WHERE NOT EXISTS (
    SELECT 1
    FROM travel_ctes tc
    WHERE tc.travel_id = t.id
)
ON CONFLICT (cte_number, cte_series) DO NOTHING;

COMMIT;
