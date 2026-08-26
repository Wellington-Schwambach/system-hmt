-- Cadastro de Embarcadores com cor de identificação
-- PostgreSQL / HMT Transportes
-- Execute este arquivo apenas se NÃO utilizar: php artisan migrate

BEGIN;

ALTER TABLE shippers
    ADD COLUMN IF NOT EXISTS display_color VARCHAR(7) NOT NULL DEFAULT '#009E60';

-- Cores iniciais para embarcadores conhecidos e uma paleta para os demais.
UPDATE shippers
SET display_color = CASE
    WHEN UPPER(TRIM(COALESCE(normalized_name, name))) = 'BRF' THEN '#2563EB'
    WHEN UPPER(TRIM(COALESCE(normalized_name, name))) = 'AURORA' THEN '#16A34A'
    WHEN UPPER(TRIM(COALESCE(normalized_name, name))) = 'MILIA' THEN '#7C3AED'
    WHEN UPPER(TRIM(COALESCE(normalized_name, name))) = 'GEO' THEN '#EA580C'
    WHEN UPPER(TRIM(COALESCE(normalized_name, name))) = 'ITRACON' THEN '#0891B2'
    ELSE CASE MOD(id::INTEGER, 10)
        WHEN 0 THEN '#0F766E'
        WHEN 1 THEN '#9333EA'
        WHEN 2 THEN '#DC2626'
        WHEN 3 THEN '#CA8A04'
        WHEN 4 THEN '#0284C7'
        WHEN 5 THEN '#C026D3'
        WHEN 6 THEN '#4F46E5'
        WHEN 7 THEN '#65A30D'
        WHEN 8 THEN '#E11D48'
        ELSE '#0D9488'
    END
END;

-- Libera o novo menu para usuários que já possuíam acesso aos cadastros.
UPDATE users
SET menu_permissions = (
    COALESCE(menu_permissions, '[]'::json)::jsonb || '["registrations.shippers"]'::jsonb
)::json
WHERE NOT (COALESCE(menu_permissions, '[]'::json)::jsonb ? 'registrations.shippers')
  AND (
      LOWER(COALESCE(role, '')) IN ('administrador', 'gestor', 'operador')
      OR COALESCE(menu_permissions, '[]'::json)::jsonb ? 'registrations.vehicles'
      OR COALESCE(menu_permissions, '[]'::json)::jsonb ? 'registrations.employees'
  );

COMMIT;
