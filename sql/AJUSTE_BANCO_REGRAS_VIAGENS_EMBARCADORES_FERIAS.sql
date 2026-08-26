-- HMT Transportes
-- Ajustes: férias em 1 ano, prazo de recebimento e documentos de embarcadores.
-- Não execute este arquivo se as migrations equivalentes já foram aplicadas.

BEGIN;

-- 1) Colaboradores: férias = data de admissão + 1 ano.
UPDATE employees
   SET vacation_date = (admission_date + INTERVAL '1 year')::date
 WHERE admission_date IS NOT NULL;

-- 2) Embarcadores: prazo de recebimento em dias.
ALTER TABLE shippers
    ADD COLUMN IF NOT EXISTS receipt_term_days SMALLINT NULL;

-- 3) Documentos dinâmicos por embarcador.
CREATE TABLE IF NOT EXISTS shipper_documents (
    id BIGSERIAL PRIMARY KEY,
    shipper_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(120) NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    position SMALLINT NOT NULL DEFAULT 0,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE NULL,
    CONSTRAINT shipper_documents_shipper_id_foreign
        FOREIGN KEY (shipper_id) REFERENCES shippers(id) ON DELETE CASCADE,
    CONSTRAINT shipper_documents_created_by_foreign
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT shipper_documents_updated_by_foreign
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS shipper_documents_shipper_id_position_index
    ON shipper_documents (shipper_id, position);

COMMIT;
