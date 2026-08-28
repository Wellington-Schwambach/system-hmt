import type { FuelFormData, FuelRecord } from './types';

export function getDefaultFuelDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultFuelDate = getDefaultFuelDate();

export const INITIAL_FUEL_FORM: FuelFormData = {
  station: '',
  vehicleId: '',
  date: defaultFuelDate,
  billingMonth: defaultFuelDate.slice(0, 7),
  km: '',
  dieselLiters: '',
  dieselTotalValue: '',
  hasArla: false,
  arlaLiters: '',
  arlaTotalValue: '',
  driverId: '',
};

export const FUEL_STORAGE_KEY = 'henrique-transportes:fuel-records';
export const INITIAL_FUEL_RECORDS: FuelRecord[] = [];
