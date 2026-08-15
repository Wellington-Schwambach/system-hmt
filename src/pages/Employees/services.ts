import axios from 'axios';

import { api } from '../../services/api';
import type {
  BrazilCityOption,
  BrazilStateOption,
  EmployeeDocument,
  EmployeeDocumentType,
  EmployeeFormData,
  EmployeeRecord,
} from './types';

interface ApiDocument {
  name: string;
  mime_type: string | null;
  size: number | null;
}

interface ApiEmployee {
  id: number;
  employee_code: string;
  full_name: string;
  cpf: string;
  rg: string | null;
  birth_date: string;
  phone: string | null;
  email: string | null;
  full_address: string | null;
  address_street: string | null;
  address_number: string | null;
  address_neighborhood: string | null;
  state_id: number | null;
  state: { id: number; abbreviation: string; name: string } | null;
  city_id: number | null;
  city: { id: number; name: string } | null;
  job_title: string;
  admission_date: string;
  termination_date: string | null;
  family_contact: string | null;
  probation_end_date: string | null;
  status: EmployeeRecord['status'];
  cnh_number: string | null;
  cnh_category: EmployeeRecord['cnhCategory'] | null;
  cnh_issued_at: string | null;
  cnh_first_license_date: string | null;
  cnh_expiry_date: string | null;
  cnh_state: string | null;
  cnh_security_code: string | null;
  aso_expiry_date: string | null;
  opentech_expiry_date: string | null;
  angellira_expiry_date: string | null;
  toxicological_expiry_date: string | null;
  trainings: string | null;
  notes: string | null;
  documents: {
    cnh: ApiDocument | null;
    aso: ApiDocument | null;
    toxicological: ApiDocument | null;
    registration_form: ApiDocument | null;
  };
  created_at: string;
  updated_at: string;
}

interface EmployeeResponse {
  message: string;
  employee: ApiEmployee;
}

function mapDocument(document: ApiDocument | null): EmployeeDocument | null {
  return document
    ? {
        name: document.name,
        mimeType: document.mime_type,
        size: document.size,
      }
    : null;
}

function mapEmployee(employee: ApiEmployee): EmployeeRecord {
  return {
    id: employee.id,
    employeeCode: employee.employee_code,
    fullName: employee.full_name,
    cpf: employee.cpf,
    rg: employee.rg ?? '',
    birthDate: employee.birth_date,
    phone: employee.phone ?? '',
    email: employee.email ?? '',
    fullAddress: employee.full_address ?? '',
    addressStreet: employee.address_street ?? '',
    addressNumber: employee.address_number ?? '',
    addressNeighborhood: employee.address_neighborhood ?? '',
    stateId: employee.state_id,
    stateName: employee.state?.name ?? '',
    stateAbbreviation: employee.state?.abbreviation ?? '',
    cityId: employee.city_id,
    cityName: employee.city?.name ?? '',
    jobTitle: employee.job_title,
    admissionDate: employee.admission_date,
    terminationDate: employee.termination_date ?? '',
    familyContact: employee.family_contact ?? '',
    probationEndDate: employee.probation_end_date ?? '',
    status: employee.status,
    cnhNumber: employee.cnh_number ?? '',
    cnhCategory: employee.cnh_category ?? '',
    cnhIssuedAt: employee.cnh_issued_at ?? '',
    cnhFirstLicenseDate: employee.cnh_first_license_date ?? '',
    cnhExpiryDate: employee.cnh_expiry_date ?? '',
    cnhState: employee.cnh_state ?? '',
    cnhSecurityCode: employee.cnh_security_code ?? '',
    asoExpiryDate: employee.aso_expiry_date ?? '',
    opentechExpiryDate: employee.opentech_expiry_date ?? '',
    angelliraExpiryDate: employee.angellira_expiry_date ?? '',
    toxicologicalExpiryDate: employee.toxicological_expiry_date ?? '',
    trainings: employee.trainings ?? '',
    notes: employee.notes ?? '',
    documents: {
      cnh: mapDocument(employee.documents.cnh),
      aso: mapDocument(employee.documents.aso),
      toxicological: mapDocument(employee.documents.toxicological),
      registrationForm: mapDocument(employee.documents.registration_form),
    },
    createdAt: employee.created_at,
    updatedAt: employee.updated_at,
  };
}

function append(payload: FormData, key: string, value: string): void {
  payload.append(key, value.trim());
}

function buildPayload(data: EmployeeFormData): FormData {
  const payload = new FormData();
  append(payload, 'employee_code', data.employeeCode);
  append(payload, 'full_name', data.fullName);
  append(payload, 'cpf', data.cpf);
  append(payload, 'rg', data.rg);
  append(payload, 'birth_date', data.birthDate);
  append(payload, 'phone', data.phone);
  append(payload, 'email', data.email);
  append(payload, 'full_address', data.fullAddress);
  append(payload, 'address_street', data.addressStreet);
  append(payload, 'address_number', data.addressNumber);
  append(payload, 'address_neighborhood', data.addressNeighborhood);
  append(payload, 'state_id', data.stateId);
  append(payload, 'city_id', data.cityId);
  append(payload, 'job_title', data.jobTitle);
  append(payload, 'admission_date', data.admissionDate);
  append(payload, 'termination_date', data.terminationDate);
  append(payload, 'family_contact', data.familyContact);
  append(payload, 'probation_end_date', data.probationEndDate);
  append(payload, 'status', data.status);
  append(payload, 'cnh_number', data.cnhNumber);
  append(payload, 'cnh_category', data.cnhCategory);
  append(payload, 'cnh_issued_at', data.cnhIssuedAt);
  append(payload, 'cnh_first_license_date', data.cnhFirstLicenseDate);
  append(payload, 'cnh_expiry_date', data.cnhExpiryDate);
  append(payload, 'cnh_state', data.cnhState);
  append(payload, 'cnh_security_code', data.cnhSecurityCode);
  append(payload, 'aso_expiry_date', data.asoExpiryDate);
  append(payload, 'opentech_expiry_date', data.opentechExpiryDate);
  append(payload, 'angellira_expiry_date', data.angelliraExpiryDate);
  append(payload, 'toxicological_expiry_date', data.toxicologicalExpiryDate);
  append(payload, 'trainings', data.trainings);
  append(payload, 'notes', data.notes);

  payload.append('remove_cnh_file', data.removeCnhFile ? '1' : '0');
  payload.append('remove_aso_file', data.removeAsoFile ? '1' : '0');
  payload.append('remove_toxicological_file', data.removeToxicologicalFile ? '1' : '0');
  payload.append(
    'remove_registration_form_file',
    data.removeRegistrationFormFile ? '1' : '0',
  );

  if (data.cnhFile) payload.append('cnh_file', data.cnhFile);
  if (data.asoFile) payload.append('aso_file', data.asoFile);
  if (data.toxicologicalFile) payload.append('toxicological_file', data.toxicologicalFile);
  if (data.registrationFormFile) {
    payload.append('registration_form_file', data.registrationFormFile);
  }

  return payload;
}

export function getEmployeeApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const response = error.response?.data as
    | { message?: string; errors?: Record<string, string[]> }
    | undefined;
  const firstValidationError = response?.errors
    ? Object.values(response.errors).flat().find(Boolean)
    : undefined;

  return firstValidationError ?? response?.message ?? fallback;
}

const documentRouteNames: Record<EmployeeDocumentType, string> = {
  cnh: 'cnh',
  aso: 'aso',
  toxicological: 'toxicological',
  registrationForm: 'registration-form',
};



export const locationService = {
  async states(): Promise<BrazilStateOption[]> {
    const response = await api.get<{
      states: Array<{ id: number; abbreviation: string; name: string }>;
    }>('/api/locations/states');

    return response.data.states;
  },

  async cities(stateId: number): Promise<BrazilCityOption[]> {
    const response = await api.get<{
      cities: Array<{ id: number; state_id: number; name: string }>;
    }>(`/api/locations/states/${stateId}/cities`);

    return response.data.cities.map((city) => ({
      id: city.id,
      stateId: city.state_id,
      name: city.name,
    }));
  },
};

export const employeeService = {
  async list(): Promise<EmployeeRecord[]> {
    const response = await api.get<{ employees: ApiEmployee[] }>('/api/employees');
    return response.data.employees.map(mapEmployee);
  },

  async create(data: EmployeeFormData): Promise<{ message: string; employee: EmployeeRecord }> {
    const response = await api.post<EmployeeResponse>('/api/employees', buildPayload(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { message: response.data.message, employee: mapEmployee(response.data.employee) };
  },

  async update(
    id: number,
    data: EmployeeFormData,
  ): Promise<{ message: string; employee: EmployeeRecord }> {
    const response = await api.post<EmployeeResponse>(`/api/employees/${id}`, buildPayload(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { message: response.data.message, employee: mapEmployee(response.data.employee) };
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/employees/${id}`);
  },

  async downloadDocument(record: EmployeeRecord, type: EmployeeDocumentType): Promise<void> {
    const document = record.documents[type];
    const response = await api.get<Blob>(
      `/api/employees/${record.id}/documents/${documentRouteNames[type]}`,
      { responseType: 'blob' },
    );
    const url = URL.createObjectURL(response.data);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = document?.name ?? `${type}-${record.employeeCode}`;
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
