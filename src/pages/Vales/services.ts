import { api } from '../../services/api';
import type { ValeCityOption, ValeEmployeeOption, ValeFormData, ValeHistoryEvent, ValeRecord } from './types';
import { normalizeFineNumberInput, parseValeMoney } from './validation';

function normalizeFineInfractionCode(value: string): string | null {
  const normalized = value.toUpperCase().replace(/[^0-9O]/g, '').replace(/O/g, '0');
  return normalized || null;
}

function payload(form: ValeFormData) {
  return {
    employee_id: Number(form.employeeId),
    category: form.category,
    withdrawal_date: form.category === 'LOAN'
      ? null
      : form.category === 'FINE'
        ? form.fineInfractionAt.slice(0, 10)
        : form.date,
    discount_start_month: form.discountStartMonth,
    advance_location: form.category === 'ADVANCE' ? form.local.trim() : null,
    boleto_due_date: form.category === 'ADVANCE' ? (form.boletoDueDate || null) : null,
    weekly_authorized_by: form.category === 'ADVANCE' ? (form.weeklyAuthorizedBy || null) : null,
    description: form.description.trim() || null,
    amount: parseValeMoney(form.amount),
    installments: Number(form.installments || '1'),
    fine_plate: form.category === 'FINE' ? form.finePlate.trim() : null,
    fine_location: form.category === 'FINE' ? form.fineLocation.trim() : null,
    fine_number: form.category === 'FINE' ? normalizeFineNumberInput(form.fineNumber) : null,
    fine_infraction_code: form.category === 'FINE' ? normalizeFineInfractionCode(form.fineInfractionCode) : null,
    fine_infraction_at: form.category === 'FINE' ? form.fineInfractionAt : null,
    fine_original_amount: form.category === 'FINE' ? parseValeMoney(form.fineOriginalAmount) : null,
    fine_observation: form.category === 'FINE' ? (form.fineObservation.trim() || null) : null,
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

  async formOptions(): Promise<{ employees: ValeEmployeeOption[]; vehiclePlates: string[]; cities: ValeCityOption[] }> {
    const response = await api.get<{
      employees: ValeEmployeeOption[];
      vehicle_plates: string[];
      cities: Array<{ id: number; name: string; state_abbreviation: string }>;
    }>('/api/vales/options');

    return {
      employees: response.data.employees,
      vehiclePlates: response.data.vehicle_plates,
      cities: response.data.cities.map((city) => ({
        id: city.id,
        name: city.name,
        stateAbbreviation: city.state_abbreviation,
      })),
    };
  },

  async cities(): Promise<ValeCityOption[]> {
    const response = await api.get<{ cities: Array<{ id: number; name: string; state_abbreviation: string }> }>('/api/vales/options');
    return response.data.cities.map((city) => ({
      id: city.id,
      name: city.name,
      stateAbbreviation: city.state_abbreviation,
    }));
  },



  async create(form: ValeFormData): Promise<ValeRecord[]> {
    const response = await api.post<{ records: ValeRecord[] }>('/api/vales', payload(form));
    return response.data.records;
  },

  async update(id: number, form: ValeFormData): Promise<ValeRecord> {
    const response = await api.put<{ record: ValeRecord }>(`/api/vales/${id}`, payload(form));
    return response.data.record;
  },

  async updateFromSettlement(id: number, form: ValeFormData, settlementId: string | null): Promise<ValeRecord> {
    const response = await api.put<{ record: ValeRecord }>(`/api/vales/${id}`, {
      ...payload(form),
      settlement_id: settlementId ? Number(settlementId) : null,
    });
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
