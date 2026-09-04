-- Segunda carreta opcional nos conjuntos ativos (PostgreSQL)
ALTER TABLE vehicle_sets ADD COLUMN IF NOT EXISTS trailer_two_id BIGINT NULL;
ALTER TABLE vehicle_sets ADD COLUMN IF NOT EXISTS trailer_two_plate VARCHAR(10) NULL;
ALTER TABLE vehicle_sets ADD COLUMN IF NOT EXISTS trailer_two_label VARCHAR(220) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_sets_trailer_two_id_foreign'
  ) THEN
    ALTER TABLE vehicle_sets
      ADD CONSTRAINT vehicle_sets_trailer_two_id_foreign
      FOREIGN KEY (trailer_two_id) REFERENCES vehicles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS vehicle_sets_active_trailer_two_unique
  ON vehicle_sets (trailer_two_id)
  WHERE status = 'ACTIVE' AND trailer_two_id IS NOT NULL;

ALTER TABLE vehicle_sets DROP CONSTRAINT IF EXISTS vehicle_sets_distinct_trailers_check;
ALTER TABLE vehicle_sets ADD CONSTRAINT vehicle_sets_distinct_trailers_check
  CHECK (trailer_two_id IS NULL OR trailer_id IS NULL OR trailer_two_id <> trailer_id);

ALTER TABLE vehicle_set_events ADD COLUMN IF NOT EXISTS trailer_two_id BIGINT NULL;
ALTER TABLE vehicle_set_events ADD COLUMN IF NOT EXISTS trailer_two_plate VARCHAR(10) NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_set_events_trailer_two_id_foreign'
  ) THEN
    ALTER TABLE vehicle_set_events
      ADD CONSTRAINT vehicle_set_events_trailer_two_id_foreign
      FOREIGN KEY (trailer_two_id) REFERENCES vehicles(id) ON DELETE SET NULL;
  END IF;
END $$;
