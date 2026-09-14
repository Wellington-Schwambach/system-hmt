-- Recalcula referência de KM, distância e média de Diesel em ordem cronológica.
-- Use este SQL apenas se preferir não executar a migration Laravel equivalente.
-- A regra considera somente abastecimentos ativos (deleted_at IS NULL).

DO $$
DECLARE
    v_vehicle_id BIGINT;
    v_baseline BIGINT;
    v_last_valid_km BIGINT;
    v_reference_km BIGINT;
    v_distance_km BIGINT;
    v_average NUMERIC(10,3);
    v_fuel_km BIGINT;
    v_liters NUMERIC;
    r RECORD;
BEGIN
    FOR v_vehicle_id IN
        SELECT DISTINCT vehicle_id
          FROM fuel_records
         WHERE deleted_at IS NULL
           AND vehicle_id IS NOT NULL
         ORDER BY vehicle_id
    LOOP
        SELECT MIN(vehicle_km_reference)
          INTO v_baseline
          FROM fuel_records
         WHERE vehicle_id = v_vehicle_id
           AND deleted_at IS NULL
           AND vehicle_km_reference IS NOT NULL
           AND vehicle_km_reference > 0;

        v_last_valid_km := v_baseline;

        FOR r IN
            SELECT id, km, diesel_liters
              FROM fuel_records
             WHERE vehicle_id = v_vehicle_id
               AND deleted_at IS NULL
             ORDER BY fuel_date, id
        LOOP
            v_fuel_km := r.km;
            v_liters := COALESCE(r.diesel_liters, 0);
            v_reference_km := v_last_valid_km;
            v_distance_km := NULL;
            v_average := 0;

            IF v_fuel_km IS NOT NULL
               AND v_reference_km IS NOT NULL
               AND v_fuel_km >= v_reference_km THEN
                v_distance_km := v_fuel_km - v_reference_km;
                IF v_liters > 0 THEN
                    v_average := ROUND(v_distance_km / v_liters, 3);
                END IF;
            END IF;

            UPDATE fuel_records
               SET vehicle_km_reference = v_reference_km,
                   distance_km = v_distance_km,
                   diesel_average = v_average
             WHERE id = r.id;

            IF v_fuel_km IS NOT NULL
               AND (v_last_valid_km IS NULL OR v_fuel_km >= v_last_valid_km) THEN
                v_last_valid_km := v_fuel_km;
            END IF;
        END LOOP;
    END LOOP;
END $$;
