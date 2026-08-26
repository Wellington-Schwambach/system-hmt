-- HMT Transportes
-- Referência de KM e média correta dos abastecimentos
-- Execute somente se NÃO for utilizar: php artisan migrate

ALTER TABLE fuel_records
    ADD COLUMN IF NOT EXISTS vehicle_km_reference BIGINT NULL,
    ADD COLUMN IF NOT EXISTS distance_km BIGINT NULL,
    ADD COLUMN IF NOT EXISTS diesel_average NUMERIC(10,3) NULL;

-- Recalcula registros antigos quando existe um abastecimento anterior do mesmo veículo.
WITH ordered AS (
    SELECT
        id,
        vehicle_id,
        km,
        diesel_liters,
        LAG(km) OVER (
            PARTITION BY vehicle_id
            ORDER BY fuel_date, id
        ) AS previous_km
    FROM fuel_records
    WHERE deleted_at IS NULL
      AND km IS NOT NULL
), calculated AS (
    SELECT
        id,
        previous_km,
        CASE
            WHEN previous_km IS NOT NULL AND km >= previous_km THEN km - previous_km
            ELSE NULL
        END AS distance_km,
        CASE
            WHEN previous_km IS NOT NULL
             AND km >= previous_km
             AND diesel_liters > 0
            THEN ROUND(((km - previous_km)::numeric / diesel_liters::numeric), 3)
            ELSE NULL
        END AS diesel_average
    FROM ordered
)
UPDATE fuel_records f
SET
    vehicle_km_reference = c.previous_km,
    distance_km = c.distance_km,
    diesel_average = c.diesel_average
FROM calculated c
WHERE f.id = c.id;
