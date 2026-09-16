-- Sincroniza o KM atual dos veículos com o maior KM ativo já lançado em abastecimentos.
-- Nunca reduz o odômetro atual do veículo.
UPDATE vehicles AS v
SET current_km = GREATEST(COALESCE(v.current_km, 0), fuel.highest_km),
    updated_at = NOW()
FROM (
    SELECT vehicle_id, MAX(km)::bigint AS highest_km
    FROM fuel_records
    WHERE deleted_at IS NULL
      AND vehicle_id IS NOT NULL
      AND km IS NOT NULL
    GROUP BY vehicle_id
) AS fuel
WHERE v.id = fuel.vehicle_id
  AND fuel.highest_km > COALESCE(v.current_km, 0);
