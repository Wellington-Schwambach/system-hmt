-- Ajustes de CT-e em Viagens
ALTER TABLE public.travel_ctes
    ADD COLUMN IF NOT EXISTS complemented_cte_number VARCHAR(30);

CREATE INDEX IF NOT EXISTS travel_ctes_complemented_cte_number_index
    ON public.travel_ctes (complemented_cte_number);
