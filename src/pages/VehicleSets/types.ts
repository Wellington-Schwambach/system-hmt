export interface VehicleSetVehicleOption {
  id: number;
  plate: string;
  fleetNumber: string | null;
  type: 'TRACTOR' | 'TRAILER';
  brand: string;
  model: string;
  manufactureYear: number;
  modelYear: number;
  currentKm: number;
  renavam: string | null;
  chassis: string | null;
  tareKg: number;
  loadCapacityKg: number;
  available: boolean;
}

export interface VehicleSetDriverOption {
  id: number;
  employeeCode: string;
  name: string;
  cpf: string;
  cnhNumber: string | null;
  cnhCategory: string | null;
  cnhExpiryDate: string | null;
  available: boolean;
}

export interface VehicleSetRecord {
  id: number;
  status: 'ACTIVE' | 'DETACHED';
  tractorId: number | null;
  trailerId: number | null;
  driverId: number | null;
  tractorPlate: string;
  tractorLabel: string;
  trailerPlate: string;
  trailerLabel: string;
  driverName: string;
  coupledAt: string;
  driverAssignedAt: string;
  detachedAt: string | null;
  tractor: VehicleSetVehicleOption | null;
  trailer: VehicleSetVehicleOption | null;
  driver: VehicleSetDriverOption | null;
}

export type VehicleSetEventAction =
  | 'COUPLED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_CHANGED'
  | 'DETACHED';

export interface VehicleSetEventRecord {
  id: number;
  vehicleSetId: number;
  action: VehicleSetEventAction;
  tractorPlate: string;
  trailerPlate: string;
  driverName: string | null;
  occurredAt: string;
  userName: string | null;
  details: Record<string, unknown>;
}

export interface VehicleSetOptions {
  tractors: VehicleSetVehicleOption[];
  trailers: VehicleSetVehicleOption[];
  drivers: VehicleSetDriverOption[];
}
