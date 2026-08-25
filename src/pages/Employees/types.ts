export type EmployeeTab = 'FORM' | 'LIST';

export type EmployeeStatus = 'ACTIVE' | 'LEAVE' | 'INACTIVE';

export type CnhCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';

export type EmployeeDocumentType = 'cnh' | 'aso' | 'toxicological' | 'registrationForm';

export interface EmployeeDocument {
  name: string;
  mimeType: string | null;
  size: number | null;
}

export interface EmployeeDocuments {
  cnh: EmployeeDocument | null;
  aso: EmployeeDocument | null;
  toxicological: EmployeeDocument | null;
  registrationForm: EmployeeDocument | null;
}

export interface BrazilStateOption {
  id: number;
  abbreviation: string;
  name: string;
}

export interface BrazilCityOption {
  id: number;
  stateId: number;
  name: string;
}

export interface EmployeeRecord {
  id: number;
  employeeCode: string;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phone: string;
  email: string;
  fullAddress: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  stateId: number | null;
  stateName: string;
  stateAbbreviation: string;
  cityId: number | null;
  cityName: string;
  jobTitle: string;
  admissionDate: string;
  terminationDate: string;
  familyContact: string;
  probationEndDate: string;
  probationExtensionEndDate: string;
  vacationDate: string;
  status: EmployeeStatus;
  cnhNumber: string;
  cnhCategory: CnhCategory | '';
  cnhIssuedAt: string;
  cnhFirstLicenseDate: string;
  cnhExpiryDate: string;
  cnhState: string;
  cnhSecurityCode: string;
  asoExpiryDate: string;
  opentechExpiryDate: string;
  angelliraExpiryDate: string;
  toxicologicalExpiryDate: string;
  trainings: string;
  notes: string;
  documents: EmployeeDocuments;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  employeeCode: string;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  phone: string;
  email: string;
  fullAddress: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  stateId: string;
  cityId: string;
  jobTitle: string;
  admissionDate: string;
  terminationDate: string;
  familyContact: string;
  probationEndDate: string;
  probationExtensionEndDate: string;
  vacationDate: string;
  status: EmployeeStatus;
  cnhNumber: string;
  cnhCategory: CnhCategory | '';
  cnhIssuedAt: string;
  cnhFirstLicenseDate: string;
  cnhExpiryDate: string;
  cnhState: string;
  cnhSecurityCode: string;
  asoExpiryDate: string;
  opentechExpiryDate: string;
  angelliraExpiryDate: string;
  toxicologicalExpiryDate: string;
  trainings: string;
  notes: string;
  cnhFile: File | null;
  asoFile: File | null;
  toxicologicalFile: File | null;
  registrationFormFile: File | null;
  removeCnhFile: boolean;
  removeAsoFile: boolean;
  removeToxicologicalFile: boolean;
  removeRegistrationFormFile: boolean;
}

export interface EmployeeOperationResult {
  success: boolean;
  error?: string;
}

export interface EmployeeFeedback {
  type: 'success' | 'error';
  message: string;
}
