-- Execute somente se preferir atualizar o PostgreSQL manualmente em vez de usar "php artisan migrate".
-- Não execute este SQL e a migration para a mesma alteração.

ALTER TABLE logistics_load_status_notes
    ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;
