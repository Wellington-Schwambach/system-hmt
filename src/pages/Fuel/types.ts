export type FuelType = 'DIESEL' | 'ARLA';
export type FuelStatus = 'F' | 'N';
export type FuelFilter = 'ALL' | 'WITH_ARLA' | 'DIESEL_ONLY';

export interface FuelRecord {
  id: string;
  date: string;
  station: string;
  plate: string;
  km: number;
  dieselLiters: number;
  dieselTotalValue: number;
  arlaLiters: number;
  arlaTotalValue: number;
  driver: string;
  status: FuelStatus;
}

export interface FuelRecordWithMetrics extends FuelRecord {
  dieselAverage: number | null;
  dieselValuePerLiter: number;
  arlaValuePerLiter: number;
  totalValue: number;
}

export interface FuelFormData {
  station: string;
  plate: string;
  date: string;
  km: string;
  dieselLiters: string;
  dieselTotalValue: string;
  hasArla: boolean;
  arlaLiters: string;
  arlaTotalValue: string;
  driver: string;
}

export interface FuelSummary {
  totalRecords: number;
  totalDieselLiters: number;
  totalArlaLiters: number;
  totalValue: number;
}

export interface LegacyFuelRecord {
  id: string;
  date: string;
  type: 'DIESEL' | 'ARLA';
  station: string;
  km: number;
  liters: number;
  totalValue?: number;
  valuePerLiter?: number;
  driver: string;
  status: 'P' | 'F' | 'N';
  plate?: string;
}

export type PersistedFuelRecord = FuelRecord | LegacyFuelRecord;
