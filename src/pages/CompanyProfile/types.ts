export interface CompanyDocumentRecord {
  id: number;
  name: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  position: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CompanyProfileRecord {
  id: number;
  legalName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  rntrc: string;
  openingDate: string;
  taxRegime: string;
  email: string;
  emailSecondary: string;
  phone: string;
  whatsapp: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  responsibleName: string;
  responsibleCpf: string;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleTwoName: string;
  responsibleTwoCpf: string;
  responsibleTwoPhone: string;
  responsibleTwoEmail: string;
  notes: string;
  documents: CompanyDocumentRecord[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CompanyProfileFormData {
  legalName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  rntrc: string;
  openingDate: string;
  taxRegime: string;
  email: string;
  emailSecondary: string;
  phone: string;
  whatsapp: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  responsibleName: string;
  responsibleCpf: string;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleTwoName: string;
  responsibleTwoCpf: string;
  responsibleTwoPhone: string;
  responsibleTwoEmail: string;
  notes: string;
}
