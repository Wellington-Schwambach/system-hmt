import type { FuelFormData, FuelRecord } from './types';

const currentDate = new Date();
const currentBillingMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

export const INITIAL_FUEL_FORM: FuelFormData = {
  station: '',
  vehicleId: '',
  date: new Date().toISOString().slice(0, 10),
  billingMonth: currentBillingMonth,
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
