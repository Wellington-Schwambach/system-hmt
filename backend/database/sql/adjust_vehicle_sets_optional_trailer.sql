-- Permite vínculos de cavalo/motorista sem carreta.
ALTER TABLE vehicle_sets ALTER COLUMN trailer_plate DROP NOT NULL;
ALTER TABLE vehicle_sets ALTER COLUMN trailer_label DROP NOT NULL;
ALTER TABLE vehicle_set_events ALTER COLUMN trailer_plate DROP NOT NULL;
