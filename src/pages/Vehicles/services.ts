import axios from 'axios';

import { api } from '../../services/api';
import type { VehicleFormData, VehicleRecord } from './types';

interface ApiVehicle {
  id: number;
  fleet_number: string | null;
  plate: string;
  type: VehicleRecord['type'];
  brand: string;
  model: string;
  manufacture_year: number;
  model_year: number;
  color: string | null;
  chassis: string | null;
  renavam: string | null;
  fuel_type: VehicleRecord['fuelType'];
  load_capacity_kg: number;
  tare_kg: number;
  current_km: number;
  status: VehicleRecord['status'];
  opentech_expiry_date: string | null;
  angellira_expiry_date: string | null;
  licensing_expiry_date: string | null;
  tachograph_expiry_date: string | null;
  notes: string | null;
  crlv: null | {
    name: string;
    mime_type: string | null;
    size: number | null;
    valid_until: string | null;
  };
  created_at: string;
  updated_at: string;
}

interface VehicleResponse {
  message: string;
  vehicle: ApiVehicle;
}

function mapVehicle(vehicle: ApiVehicle): VehicleRecord {
  return {
    id: vehicle.id,
    fleetNumber: vehicle.fleet_number ?? '',
    plate: vehicle.plate,
    type: vehicle.type,
    brand: vehicle.brand,
    model: vehicle.model,
    manufactureYear: vehicle.manufacture_year,
    modelYear: vehicle.model_year,
    color: vehicle.color ?? '',
    chassis: vehicle.chassis ?? '',
    renavam: vehicle.renavam ?? '',
    fuelType: vehicle.fuel_type,
    loadCapacityKg: vehicle.load_capacity_kg,
    tareKg: vehicle.tare_kg,
    currentKm: vehicle.current_km,
    status: vehicle.status,
    opentechExpiryDate: vehicle.opentech_expiry_date ?? '',
    angelliraExpiryDate: vehicle.angellira_expiry_date ?? '',
    licensingExpiryDate: vehicle.licensing_expiry_date ?? '',
    tachographExpiryDate: vehicle.tachograph_expiry_date ?? '',
    notes: vehicle.notes ?? '',
    crlv: vehicle.crlv
      ? {
          name: vehicle.crlv.name,
          mimeType: vehicle.crlv.mime_type,
          size: vehicle.crlv.size,
          validUntil: vehicle.crlv.valid_until ?? '',
        }
      : null,
    createdAt: vehicle.created_at,
    updatedAt: vehicle.updated_at,
  };
}

function append(formData: FormData, key: string, value: string): void {
  formData.append(key, value.trim());
}

function buildPayload(data: VehicleFormData): FormData {
  const payload = new FormData();
  append(payload, 'fleet_number', data.fleetNumber);
  append(payload, 'plate', data.plate);
  append(payload, 'type', data.type);
  append(payload, 'brand', data.brand);
  append(payload, 'model', data.model);
  append(payload, 'manufacture_year', data.manufactureYear);
  append(payload, 'model_year', data.modelYear);
  append(payload, 'color', data.color);
  append(payload, 'chassis', data.chassis);
  append(payload, 'renavam', data.renavam);
  append(payload, 'fuel_type', data.fuelType);
  append(payload, 'load_capacity_kg', data.loadCapacityKg || '0');
  append(payload, 'tare_kg', data.tareKg || '0');
  append(payload, 'current_km', data.currentKm || '0');
  append(payload, 'status', data.status);
  append(payload, 'opentech_expiry_date', data.opentechExpiryDate);
  append(payload, 'angellira_expiry_date', data.angelliraExpiryDate);
  append(payload, 'licensing_expiry_date', data.licensingExpiryDate);
  append(payload, 'tachograph_expiry_date', data.tachographExpiryDate);
  append(payload, 'notes', data.notes);
  append(payload, 'crlv_valid_until', data.crlvValidUntil);
  payload.append('remove_crlv', data.removeCrlv ? '1' : '0');

  if (data.crlvFile) {
    payload.append('crlv', data.crlvFile);
  }

  return payload;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const response = error.response?.data as
    { message?: string; errors?: Record<string, string[]> } | undefined;
  const firstValidationError = response?.errors
    ? Object.values(response.errors).flat().find(Boolean)
    : undefined;

  return firstValidationError ?? response?.message ?? fallback;
}

export const vehicleService = {
  async list(): Promise<VehicleRecord[]> {
    const response = await api.get<{ vehicles: ApiVehicle[] }>('/api/vehicles');
    return response.data.vehicles.map(mapVehicle);
  },

  async create(data: VehicleFormData): Promise<{ message: string; vehicle: VehicleRecord }> {
    const response = await api.post<VehicleResponse>('/api/vehicles', buildPayload(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { message: response.data.message, vehicle: mapVehicle(response.data.vehicle) };
  },

  async update(
    id: number,
    data: VehicleFormData,
  ): Promise<{ message: string; vehicle: VehicleRecord }> {
    const response = await api.post<VehicleResponse>(`/api/vehicles/${id}`, buildPayload(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { message: response.data.message, vehicle: mapVehicle(response.data.vehicle) };
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/vehicles/${id}`);
  },

  async downloadCrlv(record: VehicleRecord): Promise<void> {
    const response = await api.get<Blob>(`/api/vehicles/${record.id}/crlv`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = record.crlv?.name ?? `CRLV-${record.plate}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
