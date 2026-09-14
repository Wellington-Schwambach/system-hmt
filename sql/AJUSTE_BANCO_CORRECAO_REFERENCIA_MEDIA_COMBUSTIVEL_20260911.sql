-- Corrige médias de combustível cuja sequência ficou presa a uma referência
-- maior que o primeiro KM cronológico do veículo.
-- PostgreSQL

DO $$
DECLARE
    v_vehicle_id BIGINT;
    v_baseline BIGINT;
    v_last_valid_km BIGINT;
    v_first_km BIGINT;
    v_candidate BIGINT;
    r RECORD;
    v_distance BIGINT;
    v_average NUMERIC(10,3);
BEGIN
    FOR v_vehicle_id IN
        SELECT DISTINCT vehicle_id
          FROM fuel_records
         WHERE deleted_at IS NULL
           AND vehicle_id IS NOT NULL
         ORDER BY vehicle_id
    LOOP
        v_baseline := NULL;
        v_last_valid_km := NULL;
        v_first_km := NULL;
        v_candidate := NULL;

        SELECT km, vehicle_km_reference
          INTO v_first_km, v_candidate
          FROM fuel_records
         WHERE vehicle_id = v_vehicle_id
           AND deleted_at IS NULL
           AND km IS NOT NULL
           AND km > 0
         ORDER BY fuel_date, id
         LIMIT 1;

        IF v_first_km IS NOT NULL
           AND v_candidate IS NOT NULL
           AND v_candidate > 0
           AND v_candidate <= v_first_km THEN
            v_baseline := v_candidate;
        END IF;

        v_last_valid_km := v_baseline;

        FOR r IN
            SELECT id, km, diesel_liters
              FROM fuel_records
             WHERE vehicle_id = v_vehicle_id
               AND deleted_at IS NULL
             ORDER BY fuel_date, id
        LOOP
            v_distance := NULL;
            v_average := 0;

            IF r.km IS NOT NULL
               AND v_last_valid_km IS NOT NULL
               AND r.km >= v_last_valid_km THEN
                v_distance := r.km - v_last_valid_km;
                IF COALESCE(r.diesel_liters, 0) > 0 THEN
                    v_average := ROUND((v_distance::NUMERIC / r.diesel_liters::NUMERIC), 3);
                END IF;
            END IF;

            UPDATE fuel_records
               SET vehicle_km_reference = v_last_valid_km,
                   distance_km = v_distance,
                   diesel_average = v_average,
                   updated_at = NOW()
             WHERE id = r.id;

            IF r.km IS NOT NULL
               AND (v_last_valid_km IS NULL OR r.km >= v_last_valid_km) THEN
                v_last_valid_km := r.km;
            END IF;
        END LOOP;
    END LOOP;
END $$;
