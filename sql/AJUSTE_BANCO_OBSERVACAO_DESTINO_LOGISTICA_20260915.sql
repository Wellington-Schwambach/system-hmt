ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS destination_notes TEXT NULL;
