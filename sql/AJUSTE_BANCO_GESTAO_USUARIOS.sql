-- Execute este arquivo somente se você NÃO for utilizar: php artisan migrate
-- PostgreSQL - Gestão de usuários, tema e permissões

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
    ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(12) NOT NULL DEFAULT 'light',
    ADD COLUMN IF NOT EXISTS menu_permissions JSON;

UPDATE users
SET menu_permissions = '["dashboard","bi","registrations.vehicles","registrations.employees","fuel","travel","settlements","finance","maintenance","logistics","admin.security"]'::json
WHERE LOWER(role) = 'administrador';

UPDATE users
SET menu_permissions = '["dashboard","bi","registrations.vehicles","registrations.employees","fuel","travel","settlements","finance","maintenance","logistics"]'::json
WHERE LOWER(role) = 'gestor';

UPDATE users
SET menu_permissions = '["dashboard","registrations.vehicles","registrations.employees","fuel","travel","settlements","maintenance","logistics"]'::json
WHERE LOWER(role) = 'operador';

UPDATE users
SET menu_permissions = '["dashboard","bi"]'::json
WHERE LOWER(role) = 'visualizador';

UPDATE users
SET menu_permissions = '["dashboard"]'::json
WHERE menu_permissions IS NULL;

COMMIT;
