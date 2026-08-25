-- HMT Transportes
-- Ajuste do cadastro de colaboradores:
-- 1) fim da experiência após 45 dias;
-- 2) fim da prorrogação da experiência após mais 45 dias (90 dias da admissão);
-- 3) data de férias calculada em 1 ano e 10 meses após a admissão.
--
-- Use este SQL apenas se NÃO for executar `php artisan migrate`.

BEGIN;

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS probation_extension_end_date DATE,
    ADD COLUMN IF NOT EXISTS vacation_date DATE;

UPDATE employees
SET
    probation_end_date = (admission_date + INTERVAL '45 days')::date,
    probation_extension_end_date = (admission_date + INTERVAL '90 days')::date,
    vacation_date = (admission_date + INTERVAL '22 months')::date
WHERE admission_date IS NOT NULL;

COMMIT;
