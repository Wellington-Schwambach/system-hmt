-- Execute este arquivo somente se você NÃO for usar: php artisan migrate
-- PostgreSQL

BEGIN;

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(30),
    birth_date DATE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    full_address TEXT,
    job_title VARCHAR(80) NOT NULL DEFAULT 'Motorista',
    admission_date DATE NOT NULL,
    termination_date DATE,
    family_contact VARCHAR(200),
    probation_end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    cnh_number VARCHAR(20) UNIQUE,
    cnh_category VARCHAR(3),
    cnh_issued_at DATE,
    cnh_first_license_date DATE,
    cnh_expiry_date DATE,
    cnh_state VARCHAR(2),
    cnh_security_code VARCHAR(20),
    aso_expiry_date DATE,
    opentech_expiry_date DATE,
    angellira_expiry_date DATE,
    toxicological_expiry_date DATE,
    trainings TEXT,
    notes TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT employees_status_check CHECK (status IN ('ACTIVE', 'LEAVE', 'INACTIVE')),
    CONSTRAINT employees_cpf_check CHECK (cpf ~ '^\d{11}$'),
    CONSTRAINT employees_termination_check CHECK (
        termination_date IS NULL OR termination_date >= admission_date
    ),
    CONSTRAINT employees_probation_check CHECK (
        probation_end_date IS NULL OR probation_end_date >= admission_date
    )
);

CREATE INDEX employees_status_full_name_index ON employees(status, full_name);
CREATE INDEX employees_admission_date_index ON employees(admission_date);
CREATE INDEX employees_aso_expiry_date_index ON employees(aso_expiry_date);
CREATE INDEX employees_opentech_expiry_date_index ON employees(opentech_expiry_date);
CREATE INDEX employees_angellira_expiry_date_index ON employees(angellira_expiry_date);
CREATE INDEX employees_toxicological_expiry_date_index ON employees(toxicological_expiry_date);

CREATE TABLE employee_documents (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    size BIGINT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT employee_documents_type_check CHECK (
        type IN ('CNH', 'ASO', 'TOXICOLOGICAL', 'REGISTRATION_FORM')
    ),
    CONSTRAINT employee_documents_employee_type_unique UNIQUE(employee_id, type)
);

COMMIT;
