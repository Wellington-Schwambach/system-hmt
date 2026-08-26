import { api } from '../../services/api';
import type {
  FuelDriverOption,
  FuelFormData,
  FuelInvoiceTarget,
  FuelRecord,
  FuelVehicleOption,
} from './types';
import { parseDecimalInput } from './utils';


export interface LegacyLocalFuelRecord {
  date: string;
  station: string;
  plate: string;
  km?: number;
  dieselLiters: number;
  dieselTotalValue: number;
  arlaLiters?: number;
  arlaTotalValue?: number;
  driver: string;
  dieselInvoiced?: boolean;
  arlaInvoiced?: boolean;
}

interface FuelOptionsResponse {
  tractors: Array<{
    id: number;
    plate: string;
    fleet_number: string | null;
    current_km: number;
  }>;
  filter_plates: string[];
  drivers: Array<{
    id: number;
    employee_code: string | null;
    name: string;
  }>;
}

interface FuelApiRecord {
  id: number;
  vehicle_id: number | null;
  driver_id: number | null;
  date: string;
  billing_month: string;
  station: string;
  plate: string;
  km: number | null;
  vehicle_km_reference: number | null;
  distance_km: number | null;
  diesel_average: number | string | null;
  diesel_liters: number | string;
  diesel_total_value: number | string;
  arla_liters: number | string;
  arla_total_value: number | string;
  driver: string;
  diesel_invoiced: boolean;
  arla_invoiced: boolean;
  status: 'F' | 'P' | 'N';
}

interface FuelListResponse {
  records: FuelApiRecord[];
  total: number;
}

interface FuelRecordResponse {
  message: string;
  record: FuelApiRecord;
}

function mapRecord(record: FuelApiRecord): FuelRecord {
  return {
    id: record.id,
    vehicleId: record.vehicle_id,
    driverId: record.driver_id,
    date: record.date,
    billingMonth: record.billing_month || record.date.slice(0, 7),
    station: record.station,
    plate: record.plate,
    km: record.km === null ? null : Number(record.km),
    vehicleKmReference: record.vehicle_km_reference == null ? null : Number(record.vehicle_km_reference),
    distanceKm: record.distance_km == null ? null : Number(record.distance_km),
    dieselAverage: record.diesel_average == null ? null : Number(record.diesel_average),
    dieselLiters: Number(record.diesel_liters) || 0,
    dieselTotalValue: Number(record.diesel_total_value) || 0,
    arlaLiters: Number(record.arla_liters) || 0,
    arlaTotalValue: Number(record.arla_total_value) || 0,
    driver: record.driver,
    dieselInvoiced: Boolean(record.diesel_invoiced),
    arlaInvoiced: Boolean(record.arla_invoiced),
    status: record.status,
  };
}

function payload(data: FuelFormData) {
  return {
    vehicle_id: Number(data.vehicleId),
    driver_id: Number(data.driverId),
    fuel_date: data.date,
    billing_month: data.billingMonth,
    station: data.station.trim(),
    km: data.km.trim() === '' ? null : Number(data.km),
    diesel_liters: parseDecimalInput(data.dieselLiters),
    diesel_total_value: parseDecimalInput(data.dieselTotalValue),
    arla_liters: data.hasArla ? parseDecimalInput(data.arlaLiters) : 0,
    arla_total_value: data.hasArla ? parseDecimalInput(data.arlaTotalValue) : 0,
  };
}

export const fuelService = {
  async list(billingMonth?: string): Promise<FuelRecord[]> {
    const response = await api.get<FuelListResponse>('/api/fuel', {
      params: billingMonth ? { billing_month: billingMonth } : undefined,
    });
    return response.data.records.map(mapRecord);
  },

  async options(): Promise<{
    vehicles: FuelVehicleOption[];
    filterPlates: string[];
    drivers: FuelDriverOption[];
  }> {
    const response = await api.get<FuelOptionsResponse>('/api/fuel/options');

    return {
      vehicles: response.data.tractors.map((vehicle) => ({
        id: vehicle.id,
        plate: vehicle.plate,
        currentKm: Number(vehicle.current_km) || 0,
      })),
      filterPlates: response.data.filter_plates,
      drivers: response.data.drivers.map((driver) => ({
        id: driver.id,
        employeeCode: driver.employee_code,
        name: driver.name,
      })),
    };
  },

  async importLegacy(records: LegacyLocalFuelRecord[]): Promise<number> {
    const response = await api.post<{ imported: number }>('/api/fuel/import-legacy', { records });
    return Number(response.data.imported) || 0;
  },

  async create(data: FuelFormData): Promise<FuelRecord> {
    const response = await api.post<FuelRecordResponse>('/api/fuel', payload(data));
    return mapRecord(response.data.record);
  },

  async update(id: number, data: FuelFormData): Promise<FuelRecord> {
    const response = await api.put<FuelRecordResponse>(`/api/fuel/${id}`, payload(data));
    return mapRecord(response.data.record);
  },

  async invoice(id: number, target: FuelInvoiceTarget): Promise<FuelRecord> {
    const response = await api.patch<FuelRecordResponse>(`/api/fuel/${id}/invoice`, { target });
    return mapRecord(response.data.record);
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/fuel/${id}`);
  },
};
