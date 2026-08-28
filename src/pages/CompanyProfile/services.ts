import { api } from '../../services/api';
import type { CompanyDocumentRecord, CompanyProfileFormData, CompanyProfileRecord } from './types';

interface ApiCompanyDocument {
  id: number;
  name: string;
  original_name: string;
  mime_type: string | null;
  size_bytes: number;
  position: number;
  created_at: string | null;
  updated_at: string | null;
}

interface ApiCompanyProfile {
  id: number;
  legal_name: string;
  trade_name: string | null;
  cnpj: string | null;
  state_registration: string | null;
  municipal_registration: string | null;
  rntrc: string | null;
  opening_date: string | null;
  tax_regime: string | null;
  email: string | null;
  email_secondary: string | null;
  phone: string | null;
  whatsapp: string | null;
  postal_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  responsible_name: string | null;
  responsible_cpf: string | null;
  responsible_phone: string | null;
  responsible_email: string | null;
  responsible_two_name: string | null;
  responsible_two_cpf: string | null;
  responsible_two_phone: string | null;
  responsible_two_email: string | null;
  notes: string | null;
  documents: ApiCompanyDocument[];
  created_at: string | null;
  updated_at: string | null;
}

function mapDocument(document: ApiCompanyDocument): CompanyDocumentRecord {
  return {
    id: document.id,
    name: document.name,
    originalName: document.original_name,
    mimeType: document.mime_type,
    sizeBytes: Number(document.size_bytes ?? 0),
    position: Number(document.position ?? 0),
    createdAt: document.created_at,
    updatedAt: document.updated_at,
  };
}

function mapCompany(company: ApiCompanyProfile): CompanyProfileRecord {
  return {
    id: company.id,
    legalName: company.legal_name,
    tradeName: company.trade_name ?? '',
    cnpj: company.cnpj ?? '',
    stateRegistration: company.state_registration ?? '',
    municipalRegistration: company.municipal_registration ?? '',
    rntrc: company.rntrc ?? '',
    openingDate: company.opening_date ?? '',
    taxRegime: company.tax_regime ?? '',
    email: company.email ?? '',
    emailSecondary: company.email_secondary ?? '',
    phone: company.phone ?? '',
    whatsapp: company.whatsapp ?? '',
    postalCode: company.postal_code ?? '',
    street: company.street ?? '',
    number: company.number ?? '',
    complement: company.complement ?? '',
    neighborhood: company.neighborhood ?? '',
    city: company.city ?? '',
    state: company.state ?? '',
    responsibleName: company.responsible_name ?? '',
    responsibleCpf: company.responsible_cpf ?? '',
    responsiblePhone: company.responsible_phone ?? '',
    responsibleEmail: company.responsible_email ?? '',
    responsibleTwoName: company.responsible_two_name ?? '',
    responsibleTwoCpf: company.responsible_two_cpf ?? '',
    responsibleTwoPhone: company.responsible_two_phone ?? '',
    responsibleTwoEmail: company.responsible_two_email ?? '',
    notes: company.notes ?? '',
    documents: (company.documents ?? []).map(mapDocument),
    createdAt: company.created_at,
    updatedAt: company.updated_at,
  };
}

function payload(form: CompanyProfileFormData) {
  return {
    legal_name: form.legalName,
    trade_name: form.tradeName || null,
    cnpj: form.cnpj || null,
    state_registration: form.stateRegistration || null,
    municipal_registration: form.municipalRegistration || null,
    rntrc: form.rntrc || null,
    opening_date: form.openingDate || null,
    tax_regime: form.taxRegime || null,
    email: form.email || null,
    email_secondary: form.emailSecondary || null,
    phone: form.phone || null,
    whatsapp: form.whatsapp || null,
    postal_code: form.postalCode || null,
    street: form.street || null,
    number: form.number || null,
    complement: form.complement || null,
    neighborhood: form.neighborhood || null,
    city: form.city || null,
    state: form.state || null,
    responsible_name: form.responsibleName || null,
    responsible_cpf: form.responsibleCpf || null,
    responsible_phone: form.responsiblePhone || null,
    responsible_email: form.responsibleEmail || null,
    responsible_two_name: form.responsibleTwoName || null,
    responsible_two_cpf: form.responsibleTwoCpf || null,
    responsible_two_phone: form.responsibleTwoPhone || null,
    responsible_two_email: form.responsibleTwoEmail || null,
    notes: form.notes || null,
  };
}

export const companyProfileService = {
  async get(): Promise<CompanyProfileRecord | null> {
    const response = await api.get<{ company: ApiCompanyProfile | null }>('/api/company-profile');
    return response.data.company ? mapCompany(response.data.company) : null;
  },

  async save(form: CompanyProfileFormData): Promise<{ message: string; company: CompanyProfileRecord }> {
    const response = await api.put<{ message: string; company: ApiCompanyProfile }>('/api/company-profile', payload(form));
    return { message: response.data.message, company: mapCompany(response.data.company) };
  },

  async uploadDocument(companyId: number, name: string, file: File): Promise<CompanyDocumentRecord> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    const response = await api.post<{ document: ApiCompanyDocument }>(`/api/company-profile/${companyId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapDocument(response.data.document);
  },

  async renameDocument(companyId: number, documentId: number, name: string): Promise<CompanyDocumentRecord> {
    const response = await api.put<{ document: ApiCompanyDocument }>(
      `/api/company-profile/${companyId}/documents/${documentId}`,
      { name },
    );
    return mapDocument(response.data.document);
  },

  async removeDocument(companyId: number, documentId: number): Promise<void> {
    await api.delete(`/api/company-profile/${companyId}/documents/${documentId}`);
  },

  async downloadDocument(companyId: number, document: CompanyDocumentRecord): Promise<void> {
    const response = await api.get(`/api/company-profile/${companyId}/documents/${document.id}/download`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data as Blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = document.originalName || document.name;
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
