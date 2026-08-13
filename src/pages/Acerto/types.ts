import type { FuelRecord } from '../Fuel/types';
import type { TravelRecord } from '../Travel/types';

export type SettlementPeriodMode = 'MONTH' | 'CUSTOM';
export type FinancialEntryType = 'ADVANCE' | 'FINE' | 'OTHER_DISCOUNT';
export type SettlementTab = 'FORM' | 'LIST';

export interface FinancialEntry {
  id: string;
  type: FinancialEntryType;
  date: string;
  description: string;
  value: number;
}

export interface FinancialEntryFormData {
  date: string;
  description: string;
  value: string;
}

export interface VehicleAverageSummaryData {
  plate: string;
  tripsCount: number;
  averageKmPerLiter: number | null;
  fuelingsCount: number;
  source: 'PERIOD' | 'LATEST' | 'UNAVAILABLE';
}

export interface SettlementTotals {
  totalNetFreight: number;
  bonusPercent: number;
  bonusValue: number;
  baseSalary: number;
  dailyAllowance: number;
  otherEarnings: number;
  totalEarnings: number;
  advances: number;
  fines: number;
  otherDiscounts: number;
  totalDiscounts: number;
  totalReceivable: number;
}

export interface DriverSettlementSnapshot {
  id: string;
  driver: string;
  startDate: string;
  endDate: string;
  savedAt: string;
  travels: TravelRecord[];
  vehicleSummaries: VehicleAverageSummaryData[];
  entries: FinancialEntry[];
  totals: SettlementTotals;
}

export interface LoadedSettlementData {
  travels: TravelRecord[];
  fuelRecords: FuelRecord[];
  drivers: string[];
}
