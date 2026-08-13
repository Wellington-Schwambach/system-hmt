import type { VehicleFormData, VehicleFuelType, VehicleStatus, VehicleType } from './types';

export const VEHICLE_TYPE_OPTIONS: ReadonlyArray<{
  value: VehicleType;
  label: string;
}> = [
  { value: 'TRACTOR', label: 'Cavalo' },
  { value: 'TRAILER', label: 'Carreta' },
];

export const VEHICLE_FUEL_OPTIONS: ReadonlyArray<{
  value: VehicleFuelType;
  label: string;
}> = [
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'FLEX', label: 'Flex' },
  { value: 'GASOLINE', label: 'Gasolina' },
  { value: 'ELECTRIC', label: 'Elétrico' },
  { value: 'OTHER', label: 'Outro' },
];

export const VEHICLE_STATUS_OPTIONS: ReadonlyArray<{
  value: VehicleStatus;
  label: string;
}> = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'MAINTENANCE', label: 'Em manutenção' },
  { value: 'INACTIVE', label: 'Inativo' },
];

export const INITIAL_VEHICLE_FORM: VehicleFormData = {
  fleetNumber: '',
  plate: '',
  type: '',
  brand: '',
  model: '',
  manufactureYear: '',
  modelYear: '',
  color: '',
  chassis: '',
  renavam: '',
  fuelType: 'DIESEL',
  loadCapacityKg: '',
  tareKg: '',
  currentKm: '',
  status: 'ACTIVE',
  opentechExpiryDate: '',
  angelliraExpiryDate: '',
  licensingExpiryDate: '',
  notes: '',
  crlvFile: null,
  crlvValidUntil: '',
  removeCrlv: false,
};

export const MAX_CRLV_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_CRLV_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
export const ACCEPTED_CRLV_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
