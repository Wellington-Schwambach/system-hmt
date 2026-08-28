import { api } from '../../services/api';
import type {
  VehicleSetDriverOption,
  VehicleSetEventRecord,
  VehicleSetOptions,
  VehicleSetRecord,
  VehicleSetVehicleOption,
} from './types';

interface ApiVehicleOption {
  id: number;
  plate: string;
  fleet_number: string | null;
  type: 'TRACTOR' | 'TRAILER';
  brand: string;
  model: string;
  manufacture_year: number;
  model_year: number;
  current_km: number;
  renavam: string | null;
  chassis: string | null;
  tare_kg: number;
  load_capacity_kg: number;
  available: boolean;
}

interface ApiDriverOption {
  id: number;
  employee_code: string;
  name: string;
  cpf: string;
  cnh_number: string | null;
  cnh_category: string | null;
  cnh_expiry_date: string | null;
  birth_date: string | null;
  available: boolean;
}

interface ApiVehicleSet {
  id: number;
  status: 'ACTIVE' | 'DETACHED';
  tractor_id: number | null;
  trailer_id: number | null;
  driver_id: number | null;
  driver_two_id: number | null;
  tractor_plate: string;
  tractor_label: string;
  trailer_plate: string | null;
  trailer_label: string | null;
  driver_name: string;
  driver_two_name: string | null;
  coupled_at: string;
  driver_assigned_at: string;
  driver_two_assigned_at: string | null;
  detached_at: string | null;
  tractor: ApiVehicleOption | null;
  trailer: ApiVehicleOption | null;
  driver: ApiDriverOption | null;
  driver_two: ApiDriverOption | null;
}

interface ApiVehicleSetEvent {
  id: number;
  vehicle_set_id: number;
  action: VehicleSetEventRecord['action'];
  tractor_plate: string;
  trailer_plate: string | null;
  driver_name: string | null;
  occurred_at: string;
  user_name: string | null;
  details: Record<string, unknown>;
}

function mapVehicle(item: ApiVehicleOption): VehicleSetVehicleOption {
  return {
    id: item.id,
    plate: item.plate,
    fleetNumber: item.fleet_number,
    type: item.type,
    brand: item.brand,
    model: item.model,
    manufactureYear: item.manufacture_year,
    modelYear: item.model_year,
    currentKm: Number(item.current_km ?? 0),
    renavam: item.renavam,
    chassis: item.chassis,
    tareKg: Number(item.tare_kg ?? 0),
    loadCapacityKg: Number(item.load_capacity_kg ?? 0),
    available: Boolean(item.available),
  };
}

function mapDriver(item: ApiDriverOption): VehicleSetDriverOption {
  return {
    id: item.id,
    employeeCode: item.employee_code,
    name: item.name,
    cpf: item.cpf,
    cnhNumber: item.cnh_number,
    cnhCategory: item.cnh_category,
    cnhExpiryDate: item.cnh_expiry_date,
    birthDate: item.birth_date,
    available: Boolean(item.available),
  };
}

function mapSet(item: ApiVehicleSet): VehicleSetRecord {
  return {
    id: item.id,
    status: item.status,
    tractorId: item.tractor_id,
    trailerId: item.trailer_id,
    driverId: item.driver_id,
    driverTwoId: item.driver_two_id,
    tractorPlate: item.tractor_plate,
    tractorLabel: item.tractor_label,
    trailerPlate: item.trailer_plate,
    trailerLabel: item.trailer_label,
    driverName: item.driver_name,
    driverTwoName: item.driver_two_name,
    coupledAt: item.coupled_at,
    driverAssignedAt: item.driver_assigned_at,
    driverTwoAssignedAt: item.driver_two_assigned_at,
    detachedAt: item.detached_at,
    tractor: item.tractor ? mapVehicle(item.tractor) : null,
    trailer: item.trailer ? mapVehicle(item.trailer) : null,
    driver: item.driver ? mapDriver(item.driver) : null,
    driverTwo: item.driver_two ? mapDriver(item.driver_two) : null,
  };
}

export const vehicleSetService = {
  async list(): Promise<{ sets: VehicleSetRecord[]; history: VehicleSetEventRecord[] }> {
    const response = await api.get<{ sets: ApiVehicleSet[]; history: ApiVehicleSetEvent[] }>('/api/vehicle-sets');
    return {
      sets: response.data.sets.map(mapSet),
      history: response.data.history.map((event) => ({
        id: event.id,
        vehicleSetId: event.vehicle_set_id,
        action: event.action,
        tractorPlate: event.tractor_plate,
        trailerPlate: event.trailer_plate,
        driverName: event.driver_name,
        occurredAt: event.occurred_at,
        userName: event.user_name,
        details: event.details ?? {},
      })),
    };
  },

  async options(): Promise<VehicleSetOptions> {
    const response = await api.get<{
      tractors: ApiVehicleOption[];
      trailers: ApiVehicleOption[];
      drivers: ApiDriverOption[];
    }>('/api/vehicle-sets/options');

    return {
      tractors: response.data.tractors.map(mapVehicle),
      trailers: response.data.trailers.map(mapVehicle),
      drivers: response.data.drivers.map(mapDriver),
    };
  },

  async create(data: {
    tractorId: number;
    trailerId?: number | null;
    driverId: number;
    driverTwoId?: number | null;
    coupledAt: string;
    driverAssignedAt: string;
    driverTwoAssignedAt?: string | null;
  }): Promise<{ message: string; set: VehicleSetRecord }> {
    const response = await api.post<{ message: string; set: ApiVehicleSet }>('/api/vehicle-sets', {
      tractor_id: data.tractorId,
      trailer_id: data.trailerId ?? null,
      driver_id: data.driverId,
      driver_two_id: data.driverTwoId ?? null,
      coupled_at: data.coupledAt,
      driver_assigned_at: data.driverAssignedAt,
      driver_two_assigned_at: data.driverTwoAssignedAt ?? null,
    });

    return { message: response.data.message, set: mapSet(response.data.set) };
  },

  async changeDriver(
    setId: number,
    driverId: number,
    assignedAt: string,
    slot: 'PRIMARY' | 'SECONDARY' = 'PRIMARY',
  ): Promise<{ message: string; set: VehicleSetRecord }> {
    const response = await api.put<{ message: string; set: ApiVehicleSet }>(`/api/vehicle-sets/${setId}/driver`, {
      driver_id: driverId,
      assigned_at: assignedAt,
      slot,
    });
    return { message: response.data.message, set: mapSet(response.data.set) };
  },

  async detach(setId: number, detachedAt: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/api/vehicle-sets/${setId}/detach`, {
      detached_at: detachedAt,
    });
    return response.data;
  },
};
