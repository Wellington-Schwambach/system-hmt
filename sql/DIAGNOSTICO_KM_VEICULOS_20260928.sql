-- Diagnóstico de KM dos veículos / abastecimentos.
-- SOMENTE CONSULTA: não altera nenhum dado.
--
-- Regra atual: o KM do veículo pode ser elevado pelo maior KM ativo lançado em abastecimentos.
-- Esta consulta ajuda a encontrar leituras muito altas e saltos suspeitos na sequência cronológica.

WITH fuel_sequence AS (
    SELECT
        fr.id,
        fr.vehicle_id,
        fr.fuel_date,
        fr.plate,
        fr.km,
        LAG(fr.km) OVER (
            PARTITION BY fr.vehicle_id
            ORDER BY fr.fuel_date, fr.id
        ) AS previous_km
    FROM fuel_records fr
    WHERE fr.deleted_at IS NULL
      AND fr.vehicle_id IS NOT NULL
      AND fr.km IS NOT NULL
),
fuel_summary AS (
    SELECT
        vehicle_id,
        MAX(km) AS highest_fuel_km,
        COUNT(*) FILTER (WHERE km > 9999999) AS km_above_supported_limit,
        COUNT(*) FILTER (
            WHERE previous_km IS NOT NULL
              AND km > previous_km
              AND (km - previous_km) > 250000
        ) AS suspicious_jumps
    FROM fuel_sequence
    GROUP BY vehicle_id
)
SELECT
    v.id AS vehicle_id,
    v.fleet_number,
    v.plate,
    v.current_km,
    COALESCE(fs.highest_fuel_km, 0) AS highest_active_fuel_km,
    COALESCE(fs.km_above_supported_limit, 0) AS readings_above_9999999,
    COALESCE(fs.suspicious_jumps, 0) AS jumps_above_250000,
    CASE
        WHEN COALESCE(fs.km_above_supported_limit, 0) > 0 THEN 'VERIFICAR KM MUITO ALTO'
        WHEN COALESCE(fs.suspicious_jumps, 0) > 0 THEN 'VERIFICAR SALTO DE KM'
        WHEN v.current_km > COALESCE(fs.highest_fuel_km, 0) + 250000
             AND COALESCE(fs.highest_fuel_km, 0) > 0 THEN 'KM ATUAL MUITO ACIMA DOS ABASTECIMENTOS'
        ELSE 'OK'
    END AS diagnostic
FROM vehicles v
LEFT JOIN fuel_summary fs ON fs.vehicle_id = v.id
ORDER BY
    CASE
        WHEN COALESCE(fs.km_above_supported_limit, 0) > 0 THEN 0
        WHEN COALESCE(fs.suspicious_jumps, 0) > 0 THEN 1
        WHEN v.current_km > COALESCE(fs.highest_fuel_km, 0) + 250000
             AND COALESCE(fs.highest_fuel_km, 0) > 0 THEN 2
        ELSE 3
    END,
    v.plate;

-- Detalhe dos saltos suspeitos para localizar a abastecida exata.
WITH fuel_sequence AS (
    SELECT
        fr.id,
        fr.vehicle_id,
        fr.fuel_date,
        fr.plate,
        fr.driver_name,
        fr.km,
        LAG(fr.km) OVER (
            PARTITION BY fr.vehicle_id
            ORDER BY fr.fuel_date, fr.id
        ) AS previous_km
    FROM fuel_records fr
    WHERE fr.deleted_at IS NULL
      AND fr.vehicle_id IS NOT NULL
      AND fr.km IS NOT NULL
)
SELECT
    id AS fuel_record_id,
    vehicle_id,
    plate,
    fuel_date,
    driver_name,
    previous_km,
    km,
    CASE
        WHEN previous_km IS NULL THEN NULL
        ELSE km - previous_km
    END AS jump_km
FROM fuel_sequence
WHERE km > 9999999
   OR (
        previous_km IS NOT NULL
        AND km > previous_km
        AND (km - previous_km) > 250000
   )
ORDER BY vehicle_id, fuel_date, id;
