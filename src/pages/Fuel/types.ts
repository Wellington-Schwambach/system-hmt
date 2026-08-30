export type FuelType = 'DIESEL' | 'ARLA';
export type FuelStatus = 'F' | 'P' | 'N';
export type FuelFilter = 'ALL' | FuelStatus;
export type FuelInvoiceTarget = 'DIESEL' | 'ARLA';

export interface FuelVehicleOption {
  id: number;
  plate: string;
  currentKm: number;
}

export interface FuelTrailerOption {
  id: number;
  plate: string;
  fleetNumber: string | null;
}

export interface FuelActiveSetOption {
  id: number;
  tractorId: number | null;
  trailerId: number | null;
  driverId: number | null;
  driverTwoId: number | null;
}

export interface FuelDriverOption {
  id: number;
  employeeCode: string | null;
  name: string;
}

export interface FuelRecord {
  id: number;
  vehicleId: number | null;
  driverId: number | null;
  trailerId: number | null;
  trailerPlate: string | null;
  date: string;
  billingMonth: string;
  station: string;
  plate: string;
  km: number | null;
  vehicleKmReference: number | null;
  distanceKm: number | null;
  dieselAverage: number | null;
  dieselLiters: number;
  dieselTotalValue: number;
  arlaLiters: number;
  arlaTotalValue: number;
  driver: string;
  dieselInvoiced: boolean;
  arlaInvoiced: boolean;
  status: FuelStatus;
}

export interface FuelRecordWithMetrics extends FuelRecord {
  dieselValuePerLiter: number;
  arlaValuePerLiter: number;
  totalValue: number;
}

export interface FuelFormData {
  station: string;
  vehicleId: string;
  trailerId: string;
  date: string;
  billingMonth: string;
  km: string;
  dieselLiters: string;
  dieselTotalValue: string;
  hasArla: boolean;
  arlaLiters: string;
  arlaTotalValue: string;
  driverId: string;
}

export interface FuelSummary {
  totalRecords: number;
  totalDieselLiters: number;
  totalArlaLiters: number;
  totalDieselValue: number;
  totalArlaValue: number;
  totalValue: number;
}

export type PersistedFuelRecord = FuelRecord;


export interface FuelHistoryEvent {
  id: number;
  recordId: number;
  action: 'UPDATED' | 'DELETED' | 'RESTORED';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  userName: string | null;
  occurredAt: string;
  inactive: boolean;
}
