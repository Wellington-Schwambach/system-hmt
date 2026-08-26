import type { CnhCategory, EmployeeFormData, EmployeeRecord, EmployeeStatus } from './types';

export const EMPLOYEE_STATUS_OPTIONS: ReadonlyArray<{
  value: EmployeeStatus;
  label: string;
}> = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'LEAVE', label: 'Afastado' },
  { value: 'INACTIVE', label: 'Inativo' },
];

export const CNH_CATEGORY_OPTIONS: ReadonlyArray<{
  value: CnhCategory;
  label: string;
}> = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'AB', label: 'AB' },
  { value: 'AC', label: 'AC' },
  { value: 'AD', label: 'AD' },
  { value: 'AE', label: 'AE' },
];

export const ACCEPTED_EMPLOYEE_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];
export const ACCEPTED_EMPLOYEE_DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

export const MAX_EMPLOYEE_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export const INITIAL_EMPLOYEE_FORM: EmployeeFormData = {
  employeeCode: '',
  fullName: '',
  cpf: '',
  rg: '',
  birthDate: '',
  phone: '',
  email: '',
  fullAddress: '',
  addressStreet: '',
  addressNumber: '',
  addressNeighborhood: '',
  stateId: '',
  cityId: '',
  jobTitle: 'Motorista',
  admissionDate: new Date().toISOString().slice(0, 10),
  terminationDate: '',
  familyContact: '',
  probationEndDate: '',
  probationExtensionEndDate: '',
  vacationDate: '',
  status: 'ACTIVE',
  cnhNumber: '',
  cnhCategory: '',
  cnhIssuedAt: '',
  cnhFirstLicenseDate: '',
  cnhExpiryDate: '',
  cnhState: '',
  cnhSecurityCode: '',
  asoExpiryDate: '',
  opentechExpiryDate: '',
  angelliraExpiryDate: '',
  toxicologicalExpiryDate: '',
  trainings: '',
  notes: '',
  cnhFile: null,
  asoFile: null,
  toxicologicalFile: null,
  registrationFormFile: null,
  removeCnhFile: false,
  removeAsoFile: false,
  removeToxicologicalFile: false,
  removeRegistrationFormFile: false,
};


// Mantidos para compatibilidade com os módulos de viagens e acertos que ainda usam dados locais.
export const EMPLOYEES_STORAGE_KEY = 'hmt-employees';

export const INITIAL_EMPLOYEE_RECORDS: EmployeeRecord[] = [
  {
    id: 0,
    employeeCode: 'MOT-001',
    fullName: 'Motorista demonstração',
    cpf: '00000000000',
    rg: '',
    birthDate: '1990-01-01',
    phone: '',
    email: '',
    fullAddress: '',
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    stateId: null,
    stateName: '',
    stateAbbreviation: '',
    cityId: null,
    cityName: '',
    jobTitle: 'Motorista',
    admissionDate: '2024-01-01',
    terminationDate: '',
    familyContact: '',
    probationEndDate: '',
    probationExtensionEndDate: '',
    vacationDate: '',
    status: 'ACTIVE',
    cnhNumber: '',
    cnhCategory: 'E',
    cnhIssuedAt: '',
    cnhFirstLicenseDate: '',
    cnhExpiryDate: '',
    cnhState: '',
    cnhSecurityCode: '',
    asoExpiryDate: '',
    opentechExpiryDate: '',
    angelliraExpiryDate: '',
    toxicologicalExpiryDate: '',
    trainings: '',
    notes: '',
    documents: { cnh: null, aso: null, toxicological: null, registrationForm: null },
    createdAt: '',
    updatedAt: '',
  },
];
