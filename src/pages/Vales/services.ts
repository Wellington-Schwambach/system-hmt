import { api } from '../../services/api';
import type { ValeEmployeeOption, ValeFormData, ValeHistoryEvent, ValeRecord } from './types';

function parseAmount(value: string): number {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function payload(form: ValeFormData) {
  return {
    employee_id: Number(form.employeeId),
    category: form.category,
    entry_date: form.date,
    description: form.description.trim() || null,
    amount: parseAmount(form.amount),
    installments: Number(form.installments || '1'),
  };
}

export const valeService = {
  async list(): Promise<ValeRecord[]> {
    const response = await api.get<{ records: ValeRecord[] }>('/api/vales');
    return response.data.records;
  },

  async options(): Promise<ValeEmployeeOption[]> {
    const response = await api.get<{ employees: ValeEmployeeOption[] }>('/api/vales/options');
    return response.data.employees;
  },

  async create(form: ValeFormData): Promise<ValeRecord[]> {
    const response = await api.post<{ records: ValeRecord[] }>('/api/vales', payload(form));
    return response.data.records;
  },

  async update(id: number, form: ValeFormData): Promise<ValeRecord> {
    const response = await api.put<{ record: ValeRecord }>(`/api/vales/${id}`, payload(form));
    return response.data.record;
  },

  async invoice(id: number): Promise<ValeRecord> {
    const response = await api.patch<{ record: ValeRecord }>(`/api/vales/${id}/invoice`);
    return response.data.record;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/vales/${id}`);
  },

  async history(): Promise<ValeHistoryEvent[]> {
    const response = await api.get<{ events: ValeHistoryEvent[] }>('/api/vales/history/audit');
    return response.data.events;
  },
};
