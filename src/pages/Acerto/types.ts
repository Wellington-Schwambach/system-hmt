import type { FuelRecord } from '../Fuel/types';
import type { TravelRecord } from '../Travel/types';

export type SettlementPeriodMode = 'MONTH' | 'CUSTOM';
export type FinancialEntryType = 'ADVANCE' | 'FINE' | 'LOAN' | 'OTHER_DISCOUNT';
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

export type SettlementCrewMode = 'SOLO' | 'PAIR';

export interface SettlementFuelRecord extends FuelRecord {
  averageGroupKey: string;
  averageGroupLabel: string;
  crewMode: SettlementCrewMode;
  crewDriverIds: number[];
  crewDriverNames: string[];
}

export interface SettlementCrewEvent {
  id: number;
  vehicleSetId: number;
  action: 'COUPLED' | 'DRIVER_ASSIGNED' | 'DRIVER_CHANGED' | 'DRIVER_RELEASED' | 'DETACHED';
  tractorPlate: string;
  driverId: number | null;
  driverName: string | null;
  occurredAt: string;
  details: Record<string, unknown>;
}

export interface VehicleAverageSummaryData {
  groupKey: string;
  label: string;
  plate: string;
  crewMode: SettlementCrewMode;
  crewDriverIds: number[];
  crewDriverNames: string[];
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
  loans: number;
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
  crewEvents: SettlementCrewEvent[];
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
