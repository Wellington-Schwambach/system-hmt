import type { FuelRecord } from '../Fuel/types';
import type { TravelRecord } from '../Travel/types';

export type SettlementPeriodMode = 'MONTH' | 'CUSTOM';
export type FinancialEntryType = 'ADVANCE' | 'FINE' | 'OTHER_DISCOUNT';
export type SettlementTab = 'FORM' | 'LIST' | 'HISTORY';

export interface SettlementDriverOption {
  id: number;
  name: string;
}

export interface FinancialEntry {
  id: string;
  type: FinancialEntryType;
  date: string;
  description: string;
  value: number;
  source?: 'MANUAL' | 'VALE';
  valeId?: number;
}

export interface SettlementPendingVale {
  id: number;
  employeeId: number;
  category: FinancialEntryType;
  date: string;
  description: string;
  amount: number;
  installmentNumber: number;
  installmentsTotal: number;
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
  availableFuelingsCount: number;
  source: 'SELECTED' | 'UNAVAILABLE';
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
  driverId: number | null;
  driver: string;
  startDate: string;
  endDate: string;
  savedAt: string;
  travels: TravelRecord[];
  selectedFuelRecordIds: number[];
  vehicleSummaries: VehicleAverageSummaryData[];
  entries: FinancialEntry[];
  totals: SettlementTotals;
}

export interface LoadedSettlementData {
  travels: TravelRecord[];
  fuelRecords: FuelRecord[];
  drivers: string[];
  driverOptions: SettlementDriverOption[];
}

export interface SettlementHistoryEvent {
  id: number;
  settlementId: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  userName: string | null;
  occurredAt: string;
}
