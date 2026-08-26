-- Cadastro de veículos: vencimento do tacógrafo.
-- O tipo OTHER não exige alteração estrutural porque vehicles.type é VARCHAR.

ALTER TABLE public.vehicles
    ADD COLUMN IF NOT EXISTS tachograph_expiry_date date NULL;

CREATE INDEX IF NOT EXISTS vehicles_tachograph_expiry_date_index
    ON public.vehicles (tachograph_expiry_date);
