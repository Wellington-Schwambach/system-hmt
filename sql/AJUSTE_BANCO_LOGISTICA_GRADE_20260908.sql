ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS grade_number VARCHAR(100) NULL;

ALTER TABLE logistics_loads
    ADD COLUMN IF NOT EXISTS grade_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS logistics_loads_grade_at_idx
    ON logistics_loads (grade_at);
